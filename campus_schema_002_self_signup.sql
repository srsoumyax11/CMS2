-- =====================================================================
-- MIGRATION 002: Self signup, role request, approval, account go-live
-- Run after campus_schema.sql
--
-- FLOW
--  1. User registers with phone or email + OTP. Status = registered. No role.
--  2. User picks a role:
--       student / faculty / warden ...  -> role_requests
--       parent                          -> guardian_link_requests (needs a child)
--  3. Rule table decides: auto approve, or manual by an authorized role.
--  4. Approval runs in ONE transaction: grant role, fill user_code,
--     activate account, write audit log (app does the audit insert).
--  5. Until step 4, the user has no permissions at all.
-- =====================================================================
BEGIN;
SET search_path = campus, public;

-- 1. New account states. user_code is filled on approval, not at signup.
ALTER TABLE users DROP CONSTRAINT users_status_check;
ALTER TABLE users ADD CONSTRAINT users_status_check
  CHECK (status IN ('registered','pending_approval','active','frozen','rejected','archived'));
ALTER TABLE users ALTER COLUMN status SET DEFAULT 'registered';
ALTER TABLE users ALTER COLUMN user_code DROP NOT NULL;   -- UNIQUE still blocks duplicates

-- 2. Which roles can be requested, and who approves them
CREATE TABLE role_approval_rules (
  role_id uuid PRIMARY KEY REFERENCES roles(id),
  is_self_requestable boolean NOT NULL DEFAULT true,
  approval_mode text NOT NULL CHECK (approval_mode IN ('auto','manual')),
  approver_role_id uuid REFERENCES roles(id),
  needs_evidence boolean NOT NULL DEFAULT true,
  CHECK (approval_mode = 'auto' OR approver_role_id IS NOT NULL)
);

-- 3. A user asks for a role
CREATE TABLE role_requests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id),
  role_id uuid NOT NULL REFERENCES roles(id),
  claimed_code text,                               -- admission no or employee code
  claimed_roll_no text,
  claimed_registration_no text,
  claimed_course_id uuid REFERENCES courses(id),
  claimed_course_text text,
  claimed_admission_year integer,
  claimed_employee_code text,
  department_id uuid REFERENCES departments(id),   -- scope for faculty, HOD
  hostel_id uuid REFERENCES hostels(id),           -- scope for warden
  evidence_file_id uuid REFERENCES files(id),      -- ID card, offer letter
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','needs_info','approved','rejected','cancelled')),
  reviewer_id uuid REFERENCES users(id),
  reviewed_at timestamptz,
  review_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (reviewer_id IS DISTINCT FROM user_id)     -- nobody approves own request
);
CREATE UNIQUE INDEX uq_one_one_open_role_request ON role_requests (user_id, role_id)
  WHERE status IN ('pending','needs_info');
CREATE INDEX idx_role_requests_queue ON role_requests (role_id, created_at) WHERE status = 'pending';

-- 3b. Known student and employee IDs for auto match / identity import
CREATE TABLE pre_registered_identities (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_code text NOT NULL UNIQUE,
  expected_role_code text NOT NULL,
  full_name text NOT NULL,
  email text,
  phone text,
  department_id uuid REFERENCES departments(id),
  batch_id uuid REFERENCES batches(id),
  is_claimed boolean NOT NULL DEFAULT false,
  claimed_by_user_id uuid REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
-- 3c. User emergency contacts
CREATE TABLE emergency_contacts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  relation text NOT NULL,
  phone text NOT NULL,
  alternate_phone text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_emergency_contacts_user ON emergency_contacts(user_id);

-- 4. Parent flow: link to a child. Child confirms, or an admin approves.
CREATE TABLE guardian_link_requests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  guardian_user_id uuid NOT NULL REFERENCES users(id),
  student_id uuid NOT NULL REFERENCES students(user_id),
  relation text NOT NULL CHECK (relation IN ('father','mother','guardian','other')),
  dob_matched boolean NOT NULL DEFAULT false,      -- parent typed the child's admission no + DOB
  status text NOT NULL DEFAULT 'pending_student'
    CHECK (status IN ('pending_student','pending_admin','approved','rejected','expired')),
  student_confirmed_at timestamptz,
  decided_by uuid REFERENCES users(id),
  decided_at timestamptz,
  expires_at timestamptz NOT NULL DEFAULT now() + interval '7 days',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX uq_one_open_guardian_link ON guardian_link_requests (guardian_user_id, student_id)
  WHERE status IN ('pending_student','pending_admin');

CREATE TRIGGER trg_role_requests_updated BEFORE UPDATE ON role_requests
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_guardian_link_updated BEFORE UPDATE ON guardian_link_requests
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 5. Approve a role request (one transaction, all checks inside)
CREATE FUNCTION approve_role_request(p_request uuid, p_approver uuid)
RETURNS void LANGUAGE plpgsql AS $$
DECLARE
  r    role_requests%ROWTYPE;
  rule role_approval_rules%ROWTYPE;
BEGIN
  SELECT * INTO r FROM role_requests
   WHERE id = p_request AND status IN ('pending','needs_info') FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Request is not open'; END IF;

  SELECT * INTO rule FROM role_approval_rules WHERE role_id = r.role_id;
  IF NOT FOUND OR NOT rule.is_self_requestable THEN
    RAISE EXCEPTION 'This role cannot be requested';
  END IF;

  IF rule.approval_mode = 'manual' THEN
    IF p_approver IS NULL OR p_approver = r.user_id THEN
      RAISE EXCEPTION 'A different approver is required';
    END IF;
    IF NOT EXISTS (
      SELECT 1 FROM user_roles ur
       WHERE ur.user_id = p_approver AND ur.role_id = rule.approver_role_id
         AND ur.revoked_at IS NULL
         AND (ur.valid_until IS NULL OR ur.valid_until > now())
    ) THEN RAISE EXCEPTION 'Approver does not have permission'; END IF;
  END IF;

  -- Role clash check (example: marks entry vs marks approval)
  IF EXISTS (
    SELECT 1 FROM role_conflicts rc
    JOIN user_roles ur ON ur.user_id = r.user_id AND ur.revoked_at IS NULL
     AND ((rc.role_a = r.role_id AND rc.role_b = ur.role_id)
       OR (rc.role_b = r.role_id AND rc.role_a = ur.role_id))
  ) THEN RAISE EXCEPTION 'Role clash for this user'; END IF;

  INSERT INTO user_roles (user_id, role_id, scope_type, scope_id, granted_by)
  VALUES (r.user_id, r.role_id,
          CASE WHEN r.hostel_id IS NOT NULL THEN 'hostel'
               WHEN r.department_id IS NOT NULL THEN 'department'
               ELSE 'college' END,
          COALESCE(r.hostel_id, r.department_id), p_approver);

  -- A wrong or stolen ID fails here because user_code is UNIQUE
  UPDATE users SET user_code = COALESCE(user_code, r.claimed_code),
                   status = 'active'
   WHERE id = r.user_id AND status IN ('registered','pending_approval');

  UPDATE role_requests
     SET status = 'approved', reviewer_id = p_approver, reviewed_at = now()
   WHERE id = p_request;
  -- App code, same transaction: create the students or staff profile row
  -- (batch, section, department come from the approval screen).
END $$;

-- 6. Approve a parent link (child confirms, or admin approves)
CREATE FUNCTION approve_guardian_link(p_link uuid, p_actor uuid)
RETURNS void LANGUAGE plpgsql AS $$
DECLARE l guardian_link_requests%ROWTYPE;
BEGIN
  SELECT * INTO l FROM guardian_link_requests
   WHERE id = p_link AND status IN ('pending_student','pending_admin')
     AND expires_at > now() FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Link request is not open or has expired'; END IF;

  IF p_actor = l.student_id THEN
    UPDATE guardian_link_requests SET student_confirmed_at = now() WHERE id = p_link;
  ELSIF NOT EXISTS (
    SELECT 1 FROM user_roles ur JOIN roles ro ON ro.id = ur.role_id
     WHERE ur.user_id = p_actor AND ro.code IN ('admin','super_admin')
       AND ur.revoked_at IS NULL
  ) THEN
    RAISE EXCEPTION 'Only the student or an admin can approve';
  END IF;

  INSERT INTO guardians (user_id) VALUES (l.guardian_user_id) ON CONFLICT DO NOTHING;
  INSERT INTO student_guardians (student_id, guardian_id, relation)
  VALUES (l.student_id, l.guardian_user_id, l.relation) ON CONFLICT DO NOTHING;

  -- Default sharing. The student can switch any of these off later.
  INSERT INTO guardian_consents (student_id, guardian_id, scope)
  SELECT l.student_id, l.guardian_user_id, s
    FROM unnest(ARRAY['fees','attendance','results','outpass']) AS s
  ON CONFLICT DO NOTHING;

  INSERT INTO user_roles (user_id, role_id, granted_by)
  SELECT l.guardian_user_id, ro.id, p_actor FROM roles ro
   WHERE ro.code = 'parent'
     AND NOT EXISTS (SELECT 1 FROM user_roles x WHERE x.user_id = l.guardian_user_id
                      AND x.role_id = ro.id AND x.revoked_at IS NULL);

  UPDATE users SET status = 'active'
   WHERE id = l.guardian_user_id AND status IN ('registered','pending_approval');

  UPDATE guardian_link_requests
     SET status = 'approved', decided_by = p_actor, decided_at = now()
   WHERE id = p_link;
END $$;

-- 7. One place to ask "what can this user do right now?"
-- Pending, rejected and frozen users get zero rows, so zero access.
CREATE VIEW v_active_permissions AS
SELECT ur.user_id, p.code AS permission, ur.scope_type, ur.scope_id, ro.code AS role_code
FROM user_roles ur
JOIN users u            ON u.id = ur.user_id AND u.status = 'active' AND u.deleted_at IS NULL
JOIN roles ro           ON ro.id = ur.role_id AND ro.deleted_at IS NULL
JOIN role_permissions rp ON rp.role_id = ur.role_id
JOIN permissions p      ON p.id = rp.permission_id
WHERE ur.revoked_at IS NULL
  AND ur.valid_from <= now()
  AND (ur.valid_until IS NULL OR ur.valid_until > now());

-- 8. Seed rules (change to fit the college)
INSERT INTO role_approval_rules (role_id, is_self_requestable, approval_mode, approver_role_id, needs_evidence)
SELECT r.id,
       r.code IN ('student','faculty','warden'),     -- admin and parent are not requested here
       'manual',
       (SELECT id FROM roles WHERE code = CASE WHEN r.code = 'admin' THEN 'super_admin' ELSE 'admin' END),
       true
FROM roles r WHERE r.code IN ('student','faculty','warden','admin','parent');

COMMIT;
