-- =====================================================================
-- CAMPUS APP DATABASE SCHEMA  (PostgreSQL 15+)
-- Roles covered: Student, Faculty, Parent, Warden, Admin + shared system
--
-- DESIGN RULES
--  1. 3NF: no repeating groups, no partial or transitive dependencies.
--     Totals (invoice amount, attendance %) are VIEWS, not stored columns.
--  2. UUID primary keys. All times are timestamptz (UTC).
--  3. Soft delete (deleted_at) on master data. Never hard delete people,
--     money or marks. Append-only tables for logs.
--  4. Foreign keys everywhere, ON DELETE RESTRICT by default.
--  5. CHECK constraints for status values (easy to change by migration).
--  6. Four-eyes rule: requester <> approver is enforced with CHECKs.
--  7. Partial unique indexes keep "one active row" rules in the database.
--  8. Sensitive data (health, anonymous reports) is in separate tables
--     so access can be locked by role.
--  9. Run inside a migration tool (Flyway, Liquibase, Prisma, Alembic).
-- =====================================================================

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;
CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE SCHEMA IF NOT EXISTS campus;
SET search_path = campus, public;

-- ---------- 0. Shared building blocks --------------------------------
-- Standard native PostgreSQL data types for ORM compatibility

-- Column templates (copied with LIKE, dropped at the end)
CREATE TABLE _tpl_ts (
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE _tpl_sd (
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at := now(); RETURN NEW; END $$;

-- ---------- 1. Identity and access (RBAC) ----------------------------
CREATE TABLE users (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_code text NOT NULL UNIQUE,              -- student ID or employee ID
  full_name text NOT NULL,
  email text,
  phone text,
  password_hash text,
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active','frozen','archived')),
  preferred_language text NOT NULL DEFAULT 'en' CHECK (preferred_language IN ('en','hi','or')),
  email_verified_at timestamptz,
  phone_verified_at timestamptz,
  mfa_enabled boolean NOT NULL DEFAULT false,
  last_login_at timestamptz,
  LIKE _tpl_sd INCLUDING DEFAULTS
);
-- One phone and one email per person (blocks shared accounts)
CREATE UNIQUE INDEX uq_users_email ON users (email) WHERE email IS NOT NULL AND deleted_at IS NULL;
CREATE UNIQUE INDEX uq_users_phone ON users (phone) WHERE phone IS NOT NULL AND deleted_at IS NULL;

CREATE TABLE roles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  is_system boolean NOT NULL DEFAULT false,
  LIKE _tpl_sd INCLUDING DEFAULTS
);
CREATE TABLE permissions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  code text NOT NULL UNIQUE,                   -- e.g. marks.submit
  description text
);
CREATE TABLE role_permissions (
  role_id uuid NOT NULL REFERENCES roles(id),
  permission_id uuid NOT NULL REFERENCES permissions(id),
  PRIMARY KEY (role_id, permission_id)
);
-- Roles that one person must never hold together (enter marks vs approve marks)
CREATE TABLE role_conflicts (
  role_a uuid NOT NULL REFERENCES roles(id),
  role_b uuid NOT NULL REFERENCES roles(id),
  reason text,
  PRIMARY KEY (role_a, role_b),
  CHECK (role_a < role_b)
);
CREATE TABLE user_roles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id),
  role_id uuid NOT NULL REFERENCES roles(id),
  scope_type text NOT NULL DEFAULT 'college'
    CHECK (scope_type IN ('college','department','hostel','batch')),
  scope_id uuid,                               -- hostel, department or batch id
  valid_from timestamptz NOT NULL DEFAULT now(),
  valid_until timestamptz,                     -- temporary access
  granted_by uuid REFERENCES users(id),
  revoked_at timestamptz,
  CHECK ((scope_type = 'college') = (scope_id IS NULL)),
  CHECK (valid_until IS NULL OR valid_until > valid_from),
  CHECK (granted_by IS DISTINCT FROM user_id)  -- nobody grants own role
);
CREATE UNIQUE INDEX uq_user_roles_active ON user_roles
  (user_id, role_id, scope_type, COALESCE(scope_id, '00000000-0000-0000-0000-000000000000'))
  WHERE revoked_at IS NULL;

CREATE TABLE user_devices (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id),
  device_fingerprint text NOT NULL,
  device_name text,
  platform text CHECK (platform IN ('android','ios','web')),
  is_trusted boolean NOT NULL DEFAULT false,
  last_seen_at timestamptz,
  LIKE _tpl_ts INCLUDING DEFAULTS,
  UNIQUE (user_id, device_fingerprint)
);
CREATE TABLE auth_sessions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id),
  device_id uuid REFERENCES user_devices(id),
  refresh_token_hash text NOT NULL UNIQUE,
  ip_address inet,
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz,
  rotated_at timestamptz,
  grace_used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE backup_codes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id),
  code_hash text NOT NULL,
  used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE otp_requests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES users(id),
  channel text NOT NULL CHECK (channel IN ('sms','email')),
  target text NOT NULL,
  purpose text NOT NULL CHECK (purpose IN ('login','reset','verify','payment')),
  code_hash text NOT NULL,
  attempts smallint NOT NULL DEFAULT 0 CHECK (attempts <= 5),
  expires_at timestamptz NOT NULL,
  consumed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE login_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES users(id),
  device_id uuid REFERENCES user_devices(id),
  ip_address inet,
  success boolean NOT NULL,
  risk_flag text CHECK (risk_flag IN ('new_device','odd_location','many_failures')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ---------- 2. Files (all uploads are metadata only) ------------------
CREATE TABLE files (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  storage_key text NOT NULL UNIQUE,
  original_name text NOT NULL,
  mime_type text NOT NULL,
  size_bytes bigint NOT NULL CHECK (size_bytes > 0),
  sha256 char(64),
  scan_status text NOT NULL DEFAULT 'pending'
    CHECK (scan_status IN ('pending','clean','infected','failed')),
  uploaded_by uuid NOT NULL REFERENCES users(id),
  LIKE _tpl_sd INCLUDING DEFAULTS
);

-- ---------- 3. College structure --------------------------------------
CREATE TABLE pin_codes (
  pin_code char(6) PRIMARY KEY,
  city text NOT NULL,
  state text NOT NULL
);
CREATE TABLE departments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  head_user_id uuid REFERENCES users(id),
  LIKE _tpl_sd INCLUDING DEFAULTS
);
CREATE TABLE academic_years (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  label text NOT NULL UNIQUE,                  -- 2026-27
  start_date date NOT NULL,
  end_date date NOT NULL,
  is_current boolean NOT NULL DEFAULT false,
  CHECK (end_date > start_date)
);
CREATE UNIQUE INDEX uq_one_current_year ON academic_years (is_current) WHERE is_current;
CREATE TABLE terms (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  academic_year_id uuid NOT NULL REFERENCES academic_years(id),
  name text NOT NULL,                          -- Odd, Even
  start_date date NOT NULL,
  end_date date NOT NULL,
  UNIQUE (academic_year_id, name),
  CHECK (end_date > start_date)
);
CREATE TABLE courses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  department_id uuid NOT NULL REFERENCES departments(id),
  code text NOT NULL UNIQUE,                   -- BTECH-CSE
  name text NOT NULL,
  degree_level text NOT NULL CHECK (degree_level IN ('diploma','ug','pg','phd')),
  duration_semesters smallint NOT NULL CHECK (duration_semesters > 0),
  LIKE _tpl_sd INCLUDING DEFAULTS
);
CREATE TABLE batches (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id uuid NOT NULL REFERENCES courses(id),
  admission_year_id uuid NOT NULL REFERENCES academic_years(id),
  name text NOT NULL,
  UNIQUE (course_id, admission_year_id, name)
);
CREATE TABLE sections (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  batch_id uuid NOT NULL REFERENCES batches(id),
  name text NOT NULL,
  UNIQUE (batch_id, name)
);
-- Which semester number a batch is in during a term
CREATE TABLE batch_terms (
  batch_id uuid NOT NULL REFERENCES batches(id),
  term_id uuid NOT NULL REFERENCES terms(id),
  semester_no smallint NOT NULL CHECK (semester_no > 0),
  PRIMARY KEY (batch_id, term_id)
);

-- ---------- 4. People --------------------------------------------------
CREATE TABLE students (
  user_id uuid PRIMARY KEY REFERENCES users(id),
  admission_no text NOT NULL UNIQUE,
  batch_id uuid NOT NULL REFERENCES batches(id),
  section_id uuid REFERENCES sections(id),
  date_of_birth date NOT NULL,
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active','suspended','dropped','transferred','alumni')),
  admitted_on date NOT NULL,
  LIKE _tpl_sd INCLUDING DEFAULTS
);
-- Branch or batch change keeps old links
CREATE TABLE student_batch_history (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id uuid NOT NULL REFERENCES students(user_id),
  batch_id uuid NOT NULL REFERENCES batches(id),
  section_id uuid REFERENCES sections(id),
  from_date date NOT NULL,
  to_date date,
  reason text,
  CHECK (to_date IS NULL OR to_date >= from_date),
  EXCLUDE USING gist (student_id WITH =, daterange(from_date, to_date, '[]') WITH &&)
);
CREATE TABLE student_status_history (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id uuid NOT NULL REFERENCES students(user_id),
  from_status text,
  to_status text NOT NULL,
  reason text,
  changed_by uuid NOT NULL REFERENCES users(id),
  effective_on date NOT NULL DEFAULT current_date,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE staff (
  user_id uuid PRIMARY KEY REFERENCES users(id),
  employee_code text NOT NULL UNIQUE,
  department_id uuid REFERENCES departments(id),
  designation text NOT NULL,
  joined_on date NOT NULL,
  exit_on date,
  LIKE _tpl_sd INCLUDING DEFAULTS,
  CHECK (exit_on IS NULL OR exit_on >= joined_on)
);
CREATE TABLE guardians (
  user_id uuid PRIMARY KEY REFERENCES users(id),
  LIKE _tpl_ts INCLUDING DEFAULTS
);
CREATE TABLE student_guardians (
  student_id uuid NOT NULL REFERENCES students(user_id),
  guardian_id uuid NOT NULL REFERENCES guardians(user_id),
  relation text NOT NULL CHECK (relation IN ('father','mother','guardian','other')),
  is_primary boolean NOT NULL DEFAULT false,
  PRIMARY KEY (student_id, guardian_id)
);
CREATE UNIQUE INDEX uq_one_primary_guardian ON student_guardians (student_id) WHERE is_primary;
-- What the student allows each guardian to see
CREATE TABLE guardian_consents (
  student_id uuid NOT NULL,
  guardian_id uuid NOT NULL,
  scope text NOT NULL CHECK (scope IN ('fees','attendance','results','outpass','location','warnings')),
  granted_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz,
  PRIMARY KEY (student_id, guardian_id, scope),
  FOREIGN KEY (student_id, guardian_id) REFERENCES student_guardians(student_id, guardian_id)
);
CREATE TABLE addresses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id),
  kind text NOT NULL CHECK (kind IN ('permanent','current')),
  line1 text NOT NULL,
  line2 text,
  pin_code char(6) NOT NULL REFERENCES pin_codes(pin_code),
  LIKE _tpl_sd INCLUDING DEFAULTS
);
CREATE TABLE user_emergency_contacts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id),
  contact_name text NOT NULL,
  phone text NOT NULL,
  relation text NOT NULL,
  sort_order smallint NOT NULL DEFAULT 1,
  UNIQUE (user_id, sort_order)
);
CREATE TABLE name_correction_requests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id uuid NOT NULL REFERENCES students(user_id),
  old_name text NOT NULL,
  new_name text NOT NULL,
  evidence_file_id uuid REFERENCES files(id),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  decided_by uuid REFERENCES users(id),
  decided_at timestamptz,
  LIKE _tpl_ts INCLUDING DEFAULTS
);
CREATE TABLE mentor_assignments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id uuid NOT NULL REFERENCES students(user_id),
  mentor_id uuid NOT NULL REFERENCES staff(user_id),
  from_date date NOT NULL DEFAULT current_date,
  to_date date
);
CREATE UNIQUE INDEX uq_one_active_mentor ON mentor_assignments (student_id) WHERE to_date IS NULL;
CREATE TABLE mentor_notes (                      -- private to the mentor
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  mentor_id uuid NOT NULL REFERENCES staff(user_id),
  student_id uuid NOT NULL REFERENCES students(user_id),
  meeting_on date NOT NULL,
  note text NOT NULL,
  LIKE _tpl_ts INCLUDING DEFAULTS
);

-- Admission
CREATE TABLE admission_applications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  applicant_user_id uuid NOT NULL REFERENCES users(id),
  course_id uuid NOT NULL REFERENCES courses(id),
  academic_year_id uuid NOT NULL REFERENCES academic_years(id),
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft','submitted','under_review','accepted','rejected','waitlisted','joined')),
  submitted_at timestamptz,
  decided_by uuid REFERENCES users(id),
  decided_at timestamptz,
  LIKE _tpl_sd INCLUDING DEFAULTS,
  UNIQUE (applicant_user_id, course_id, academic_year_id)
);
CREATE TABLE application_documents (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id uuid NOT NULL REFERENCES admission_applications(id),
  doc_kind text NOT NULL,                      -- marksheet, id proof, photo
  file_id uuid NOT NULL REFERENCES files(id),
  status text NOT NULL DEFAULT 'uploaded' CHECK (status IN ('uploaded','verified','rejected')),
  verified_by uuid REFERENCES users(id),
  verified_at timestamptz,
  reject_reason text,
  UNIQUE (application_id, doc_kind)
);

-- ---------- 5. Places ---------------------------------------------------
CREATE TABLE locations (                         -- generic place tree for map, assets, tickets
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_id uuid REFERENCES locations(id),
  kind text NOT NULL CHECK (kind IN ('campus','building','floor','room','hostel','hostel_room','outdoor')),
  name text NOT NULL,
  latitude numeric(9,6),
  longitude numeric(9,6),
  LIKE _tpl_sd INCLUDING DEFAULTS
);
CREATE TABLE buildings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  location_id uuid REFERENCES locations(id)
);
CREATE TABLE rooms (                             -- classrooms and labs
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  building_id uuid NOT NULL REFERENCES buildings(id),
  room_no text NOT NULL,
  room_type text NOT NULL CHECK (room_type IN ('classroom','lab','hall','seminar')),
  capacity smallint NOT NULL CHECK (capacity > 0),
  location_id uuid REFERENCES locations(id),
  LIKE _tpl_sd INCLUDING DEFAULTS,
  UNIQUE (building_id, room_no)
);
CREATE TABLE vendors (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  kind text NOT NULL CHECK (kind IN ('mess','bus','canteen','repair','supplier','other')),
  contact_phone text,
  email text,
  is_active boolean NOT NULL DEFAULT true,
  LIKE _tpl_sd INCLUDING DEFAULTS
);
CREATE TABLE vendor_contracts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id uuid NOT NULL REFERENCES vendors(id),
  starts_on date NOT NULL,
  ends_on date NOT NULL,
  contract_value numeric(12,2) NOT NULL,
  payment_due_day smallint CHECK (payment_due_day BETWEEN 1 AND 31),
  file_id uuid REFERENCES files(id),
  CHECK (ends_on > starts_on)
);

-- ---------- 6. Academics ------------------------------------------------
CREATE TABLE subjects (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  credits numeric(3,1) NOT NULL CHECK (credits >= 0),
  subject_type text NOT NULL CHECK (subject_type IN ('theory','lab','project')),
  LIKE _tpl_sd INCLUDING DEFAULTS
);
CREATE TABLE course_subjects (
  course_id uuid NOT NULL REFERENCES courses(id),
  subject_id uuid NOT NULL REFERENCES subjects(id),
  semester_no smallint NOT NULL CHECK (semester_no > 0),
  is_elective boolean NOT NULL DEFAULT false,
  PRIMARY KEY (course_id, subject_id)
);
CREATE TABLE syllabus_versions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  subject_id uuid NOT NULL REFERENCES subjects(id),
  version_no integer NOT NULL,
  file_id uuid NOT NULL REFERENCES files(id),
  effective_from date NOT NULL,
  UNIQUE (subject_id, version_no)
);
CREATE TABLE periods (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  period_no smallint NOT NULL UNIQUE,
  start_time time NOT NULL,
  end_time time NOT NULL,
  CHECK (end_time > start_time)
);
-- Who teaches which subject to which section in a term
CREATE TABLE subject_offerings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  subject_id uuid NOT NULL REFERENCES subjects(id),
  term_id uuid NOT NULL REFERENCES terms(id),
  section_id uuid NOT NULL REFERENCES sections(id),
  faculty_id uuid NOT NULL REFERENCES staff(user_id),
  LIKE _tpl_sd INCLUDING DEFAULTS,
  UNIQUE (subject_id, term_id, section_id)
);
CREATE TABLE timetable_entries (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  offering_id uuid NOT NULL REFERENCES subject_offerings(id),
  room_id uuid NOT NULL REFERENCES rooms(id),
  day_of_week smallint NOT NULL CHECK (day_of_week BETWEEN 1 AND 7),
  period_id uuid NOT NULL REFERENCES periods(id),
  valid_from date NOT NULL,
  valid_to date,
  changed_by uuid REFERENCES users(id),
  LIKE _tpl_sd INCLUDING DEFAULTS,
  CHECK (valid_to IS NULL OR valid_to > valid_from),
  -- No two classes in one room at the same time
  CONSTRAINT no_room_clash EXCLUDE USING gist
    (room_id WITH =, day_of_week WITH =, period_id WITH =,
     daterange(valid_from, valid_to, '[)') WITH &&) WHERE (deleted_at IS NULL)
);
-- Faculty and section clash (needs a join, so a trigger)
CREATE FUNCTION check_timetable_clash() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE o subject_offerings%ROWTYPE;
BEGIN
  SELECT * INTO o FROM subject_offerings WHERE id = NEW.offering_id;
  IF EXISTS (
    SELECT 1 FROM timetable_entries t
    JOIN subject_offerings x ON x.id = t.offering_id
    WHERE t.id <> NEW.id AND t.deleted_at IS NULL
      AND t.day_of_week = NEW.day_of_week AND t.period_id = NEW.period_id
      AND daterange(t.valid_from, t.valid_to, '[)') && daterange(NEW.valid_from, NEW.valid_to, '[)')
      AND (x.faculty_id = o.faculty_id OR x.section_id = o.section_id)
  ) THEN
    RAISE EXCEPTION 'Timetable clash for faculty or section' USING ERRCODE = 'exclusion_violation';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_timetable_clash BEFORE INSERT OR UPDATE ON timetable_entries
  FOR EACH ROW WHEN (NEW.deleted_at IS NULL) EXECUTE FUNCTION check_timetable_clash();

CREATE TABLE holidays (
  holiday_date date PRIMARY KEY,
  name text NOT NULL
);
CREATE TABLE course_materials (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  offering_id uuid NOT NULL REFERENCES subject_offerings(id),
  title text NOT NULL,
  uploaded_by uuid NOT NULL REFERENCES staff(user_id),
  LIKE _tpl_sd INCLUDING DEFAULTS
);
CREATE TABLE material_versions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  material_id uuid NOT NULL REFERENCES course_materials(id),
  version_no integer NOT NULL,
  file_id uuid NOT NULL REFERENCES files(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (material_id, version_no)
);
CREATE TABLE assignments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  offering_id uuid NOT NULL REFERENCES subject_offerings(id),
  title text NOT NULL,
  description text,
  due_at timestamptz NOT NULL,
  max_marks numeric(6,2) NOT NULL CHECK (max_marks > 0),
  created_by uuid NOT NULL REFERENCES staff(user_id),
  LIKE _tpl_sd INCLUDING DEFAULTS
);
CREATE TABLE assignment_submissions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  assignment_id uuid NOT NULL REFERENCES assignments(id),
  student_id uuid NOT NULL REFERENCES students(user_id),
  file_id uuid NOT NULL REFERENCES files(id),
  submitted_at timestamptz NOT NULL DEFAULT now(),
  similarity_percent numeric(5,2) CHECK (similarity_percent BETWEEN 0 AND 100),
  marks numeric(6,2) CHECK (marks >= 0),
  feedback text,
  graded_by uuid REFERENCES staff(user_id),
  graded_at timestamptz,
  UNIQUE (assignment_id, student_id)
);

-- ---------- 7. Attendance and leave ------------------------------------
CREATE TABLE class_sessions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  offering_id uuid NOT NULL REFERENCES subject_offerings(id),
  session_date date NOT NULL,
  period_id uuid NOT NULL REFERENCES periods(id),
  status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled','held','cancelled')),
  substitute_faculty_id uuid REFERENCES staff(user_id),
  cancel_reason text,
  UNIQUE (offering_id, session_date, period_id)
);
CREATE TABLE attendance_codes (                  -- rotating QR or short code
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id uuid NOT NULL REFERENCES class_sessions(id),
  code_hash text NOT NULL,
  expires_at timestamptz NOT NULL
);
CREATE TABLE attendance_records (
  session_id uuid NOT NULL REFERENCES class_sessions(id),
  student_id uuid NOT NULL REFERENCES students(user_id),
  status text NOT NULL CHECK (status IN ('present','absent','late','on_leave')),
  method text NOT NULL CHECK (method IN ('qr','manual','biometric','leave_sync')),
  marked_by uuid REFERENCES users(id),
  marked_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (session_id, student_id)
);
CREATE TABLE attendance_disputes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id uuid NOT NULL,
  student_id uuid NOT NULL,
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  decided_by uuid REFERENCES staff(user_id),
  decided_at timestamptz,
  LIKE _tpl_ts INCLUDING DEFAULTS,
  FOREIGN KEY (session_id, student_id) REFERENCES attendance_records(session_id, student_id),
  UNIQUE (session_id, student_id)
);
CREATE TABLE attendance_rules (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id uuid REFERENCES courses(id),         -- NULL = college default
  min_percent numeric(5,2) NOT NULL CHECK (min_percent BETWEEN 0 AND 100),
  effective_from date NOT NULL
);
CREATE UNIQUE INDEX uq_attendance_rule ON attendance_rules
  (COALESCE(course_id, '00000000-0000-0000-0000-000000000000'), effective_from);
CREATE TABLE leave_types (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  code text NOT NULL UNIQUE,                     -- medical, event, casual, duty
  name text NOT NULL,
  applies_to text NOT NULL CHECK (applies_to IN ('student','staff','both'))
);
CREATE TABLE leave_requests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id uuid NOT NULL REFERENCES users(id),
  leave_type_id uuid NOT NULL REFERENCES leave_types(id),
  from_date date NOT NULL,
  to_date date NOT NULL,
  reason text NOT NULL,
  evidence_file_id uuid REFERENCES files(id),
  substitute_user_id uuid REFERENCES users(id),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','cancelled')),
  decided_by uuid REFERENCES users(id),
  decided_at timestamptz,
  LIKE _tpl_ts INCLUDING DEFAULTS,
  CHECK (to_date >= from_date),
  CHECK (decided_by IS DISTINCT FROM requester_id)
);

-- ---------- 8. Exams and results ---------------------------------------
CREATE TABLE exams (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  term_id uuid NOT NULL REFERENCES terms(id),
  name text NOT NULL,
  kind text NOT NULL CHECK (kind IN ('internal','mid','end','supplementary')),
  starts_on date NOT NULL,
  ends_on date NOT NULL,
  results_published_at timestamptz,
  results_withdrawn_at timestamptz,
  LIKE _tpl_sd INCLUDING DEFAULTS,
  CHECK (ends_on >= starts_on)
);
CREATE TABLE exam_papers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  exam_id uuid NOT NULL REFERENCES exams(id),
  subject_id uuid NOT NULL REFERENCES subjects(id),
  exam_date date NOT NULL,
  start_time time NOT NULL,
  max_marks numeric(6,2) NOT NULL CHECK (max_marks > 0),
  paper_file_id uuid REFERENCES files(id),       -- encrypted
  unlock_at timestamptz,                         -- time lock
  UNIQUE (exam_id, subject_id)
);
CREATE TABLE exam_duties (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  exam_paper_id uuid NOT NULL REFERENCES exam_papers(id),
  staff_id uuid NOT NULL REFERENCES staff(user_id),
  room_id uuid NOT NULL REFERENCES rooms(id),
  status text NOT NULL DEFAULT 'assigned' CHECK (status IN ('assigned','accepted','swap_requested','done')),
  UNIQUE (exam_paper_id, staff_id)
);
CREATE TABLE mark_entries (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  exam_paper_id uuid NOT NULL REFERENCES exam_papers(id),
  student_id uuid NOT NULL REFERENCES students(user_id),
  marks numeric(6,2) CHECK (marks >= 0),
  is_absent boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','submitted','locked')),
  entered_by uuid NOT NULL REFERENCES staff(user_id),
  submitted_at timestamptz,
  LIKE _tpl_ts INCLUDING DEFAULTS,
  UNIQUE (exam_paper_id, student_id),
  CHECK (NOT (is_absent AND marks IS NOT NULL))
);
CREATE TABLE mark_change_requests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  mark_entry_id uuid NOT NULL REFERENCES mark_entries(id),
  old_marks numeric(6,2),
  new_marks numeric(6,2) NOT NULL CHECK (new_marks >= 0),
  reason text NOT NULL,
  requested_by uuid NOT NULL REFERENCES staff(user_id),
  approved_by uuid REFERENCES users(id),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  decided_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (approved_by IS DISTINCT FROM requested_by)   -- four-eyes rule
);
CREATE TABLE recheck_requests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  mark_entry_id uuid NOT NULL REFERENCES mark_entries(id),
  student_id uuid NOT NULL REFERENCES students(user_id),
  reason text,
  status text NOT NULL DEFAULT 'requested'
    CHECK (status IN ('requested','paid','in_review','changed','unchanged','rejected')),
  new_marks numeric(6,2) CHECK (new_marks >= 0),
  decided_by uuid REFERENCES users(id),
  decided_at timestamptz,
  LIKE _tpl_ts INCLUDING DEFAULTS,
  UNIQUE (mark_entry_id, student_id)
);

-- ---------- 9. Hostel ----------------------------------------------------
CREATE TABLE hostels (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  location_id uuid REFERENCES locations(id),
  LIKE _tpl_sd INCLUDING DEFAULTS
);
CREATE TABLE hostel_wardens (
  hostel_id uuid NOT NULL REFERENCES hostels(id),
  staff_id uuid NOT NULL REFERENCES staff(user_id),
  is_backup boolean NOT NULL DEFAULT false,
  from_date date NOT NULL DEFAULT current_date,
  to_date date,
  PRIMARY KEY (hostel_id, staff_id, from_date)
);
CREATE TABLE hostel_rooms (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  hostel_id uuid NOT NULL REFERENCES hostels(id),
  floor_no smallint NOT NULL,
  room_no text NOT NULL,
  location_id uuid REFERENCES locations(id),
  LIKE _tpl_sd INCLUDING DEFAULTS,
  UNIQUE (hostel_id, room_no)
);
CREATE TABLE beds (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  hostel_room_id uuid NOT NULL REFERENCES hostel_rooms(id),
  bed_no smallint NOT NULL,
  is_usable boolean NOT NULL DEFAULT true,
  UNIQUE (hostel_room_id, bed_no)
);
CREATE TABLE bed_allocations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  bed_id uuid NOT NULL REFERENCES beds(id),
  student_id uuid NOT NULL REFERENCES students(user_id),
  from_date date NOT NULL DEFAULT current_date,
  to_date date,
  allocated_by uuid REFERENCES users(id),
  CHECK (to_date IS NULL OR to_date >= from_date)
);
CREATE UNIQUE INDEX uq_bed_one_active ON bed_allocations (bed_id) WHERE to_date IS NULL;
CREATE UNIQUE INDEX uq_student_one_bed ON bed_allocations (student_id) WHERE to_date IS NULL;
CREATE TABLE room_change_requests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id uuid NOT NULL REFERENCES students(user_id),
  requested_hostel_room_id uuid REFERENCES hostel_rooms(id),
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  decided_by uuid REFERENCES users(id),
  decided_at timestamptz,
  LIKE _tpl_ts INCLUDING DEFAULTS
);
CREATE TABLE outpass_requests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id uuid NOT NULL REFERENCES students(user_id),
  reason text NOT NULL,
  destination text NOT NULL,
  out_at timestamptz NOT NULL,
  expected_return_at timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','approved','rejected','cancelled','out','returned','overdue')),
  decided_by uuid REFERENCES users(id),
  decided_at timestamptz,
  decision_note text,
  LIKE _tpl_ts INCLUDING DEFAULTS,
  CHECK (expected_return_at > out_at)
);
CREATE TABLE outpass_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  outpass_id uuid NOT NULL REFERENCES outpass_requests(id),
  event_kind text NOT NULL CHECK (event_kind IN ('out','in')),
  occurred_at timestamptz NOT NULL DEFAULT now(),
  method text NOT NULL CHECK (method IN ('qr','manual','geofence')),
  recorded_by uuid REFERENCES users(id)
);
CREATE TABLE dishes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE
);
CREATE TABLE mess_menu_entries (
  hostel_id uuid NOT NULL REFERENCES hostels(id),
  menu_date date NOT NULL,
  meal_type text NOT NULL CHECK (meal_type IN ('breakfast','lunch','snacks','dinner')),
  dish_id uuid NOT NULL REFERENCES dishes(id),
  PRIMARY KEY (hostel_id, menu_date, meal_type, dish_id)
);
CREATE TABLE mess_feedback (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id uuid NOT NULL REFERENCES students(user_id),
  hostel_id uuid NOT NULL REFERENCES hostels(id),
  menu_date date NOT NULL,
  meal_type text NOT NULL CHECK (meal_type IN ('breakfast','lunch','snacks','dinner')),
  rating smallint NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (student_id, hostel_id, menu_date, meal_type)
);
CREATE TABLE mess_hygiene_checks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  hostel_id uuid NOT NULL REFERENCES hostels(id),
  check_date date NOT NULL,
  checked_by uuid NOT NULL REFERENCES users(id),
  passed boolean NOT NULL,
  notes text,
  UNIQUE (hostel_id, check_date)
);
CREATE TABLE visitors (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  host_user_id uuid NOT NULL REFERENCES users(id),
  visitor_name text NOT NULL,
  visitor_phone text,
  purpose text,
  pass_code_hash text NOT NULL,
  valid_from timestamptz NOT NULL,
  valid_until timestamptz NOT NULL,
  approved_by uuid REFERENCES users(id),
  checked_in_at timestamptz,
  checked_out_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (valid_until > valid_from)
);
CREATE TABLE lost_found_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  kind text NOT NULL CHECK (kind IN ('lost','found')),
  reported_by uuid NOT NULL REFERENCES users(id),
  title text NOT NULL,
  description text,
  location_id uuid REFERENCES locations(id),
  photo_file_id uuid REFERENCES files(id),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','claimed','returned','closed')),
  LIKE _tpl_sd INCLUDING DEFAULTS
);
CREATE TABLE lost_found_claims (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id uuid NOT NULL REFERENCES lost_found_items(id),
  claimant_id uuid NOT NULL REFERENCES users(id),
  proof_description text NOT NULL,               -- claimer must describe the item
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','verified','rejected')),
  verified_by uuid REFERENCES users(id),
  handed_over_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (item_id, claimant_id)
);

-- ---------- 10. Assets, tickets and complaints --------------------------
CREATE TABLE asset_categories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE
);
CREATE TABLE assets (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  asset_tag text NOT NULL UNIQUE,                -- printed on the QR sticker
  category_id uuid NOT NULL REFERENCES asset_categories(id),
  name text NOT NULL,
  serial_no text,
  purchased_on date,
  purchase_cost numeric(12,2),
  vendor_id uuid REFERENCES vendors(id),
  status text NOT NULL DEFAULT 'in_use' CHECK (status IN ('in_use','in_store','repair','lost','disposed')),
  item_condition text NOT NULL DEFAULT 'good' CHECK (item_condition IN ('new','good','fair','poor')),
  location_id uuid REFERENCES locations(id),
  LIKE _tpl_sd INCLUDING DEFAULTS
);
CREATE TABLE asset_assignments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  asset_id uuid NOT NULL REFERENCES assets(id),
  user_id uuid NOT NULL REFERENCES users(id),
  issued_by uuid NOT NULL REFERENCES users(id),
  issued_at timestamptz NOT NULL DEFAULT now(),
  returned_at timestamptz
);
CREATE UNIQUE INDEX uq_asset_one_holder ON asset_assignments (asset_id) WHERE returned_at IS NULL;
CREATE TABLE asset_damage_reports (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  asset_id uuid NOT NULL REFERENCES assets(id),
  reported_by uuid NOT NULL REFERENCES users(id),
  description text NOT NULL,
  photo_file_id uuid REFERENCES files(id),
  charged_user_id uuid REFERENCES users(id),
  charge_amount numeric(12,2),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','charged','waived','closed')),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE SEQUENCE ticket_no_seq;
CREATE TABLE ticket_categories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  code text NOT NULL UNIQUE,                     -- electrical, plumbing, mess, wifi, ragging
  name text NOT NULL,
  default_sla_hours integer NOT NULL CHECK (default_sla_hours > 0),
  owner_role_id uuid REFERENCES roles(id)
);
CREATE TABLE tickets (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_no text NOT NULL UNIQUE DEFAULT ('TKT-' || lpad(nextval('ticket_no_seq')::text, 8, '0')),
  category_id uuid NOT NULL REFERENCES ticket_categories(id),
  raised_by uuid NOT NULL REFERENCES users(id),
  location_id uuid REFERENCES locations(id),
  asset_id uuid REFERENCES assets(id),
  title text NOT NULL,
  description text,
  priority text NOT NULL DEFAULT 'normal' CHECK (priority IN ('low','normal','high','urgent')),
  status text NOT NULL DEFAULT 'open'
    CHECK (status IN ('open','assigned','in_progress','fixed','rejected','reopened','closed')),
  assigned_user_id uuid REFERENCES users(id),
  assigned_vendor_id uuid REFERENCES vendors(id),
  sla_due_at timestamptz NOT NULL,
  escalation_level smallint NOT NULL DEFAULT 0,
  resolved_at timestamptz,
  LIKE _tpl_sd INCLUDING DEFAULTS
);
CREATE TABLE escalation_rules (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id uuid NOT NULL REFERENCES ticket_categories(id),
  level smallint NOT NULL CHECK (level > 0),
  after_hours integer NOT NULL CHECK (after_hours > 0),
  escalate_to_role_id uuid NOT NULL REFERENCES roles(id),
  UNIQUE (category_id, level)
);
CREATE TABLE ticket_comments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id uuid NOT NULL REFERENCES tickets(id),
  author_id uuid NOT NULL REFERENCES users(id),
  body text NOT NULL,
  is_internal boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE ticket_attachments (
  ticket_id uuid NOT NULL REFERENCES tickets(id),
  file_id uuid NOT NULL REFERENCES files(id),
  PRIMARY KEY (ticket_id, file_id)
);
CREATE TABLE ticket_status_history (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id uuid NOT NULL REFERENCES tickets(id),
  from_status text,
  to_status text NOT NULL,
  changed_by uuid REFERENCES users(id),     -- NULL = system (auto escalation)
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ---------- 11. Fees and payments ---------------------------------------
CREATE TABLE fee_heads (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  code text NOT NULL UNIQUE,                     -- tuition, hostel, exam, bus, fine
  name text NOT NULL
);
CREATE TABLE fee_structures (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id uuid NOT NULL REFERENCES courses(id),
  academic_year_id uuid NOT NULL REFERENCES academic_years(id),
  UNIQUE (course_id, academic_year_id)
);
CREATE TABLE fee_structure_items (
  fee_structure_id uuid NOT NULL REFERENCES fee_structures(id),
  fee_head_id uuid NOT NULL REFERENCES fee_heads(id),
  amount numeric(12,2) NOT NULL,
  due_date date NOT NULL,
  PRIMARY KEY (fee_structure_id, fee_head_id)
);
CREATE TABLE fine_rules (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  fee_head_id uuid NOT NULL REFERENCES fee_heads(id),
  grace_days smallint NOT NULL DEFAULT 0,
  amount_per_day numeric(12,2) NOT NULL,
  max_amount numeric(12,2),
  effective_from date NOT NULL,
  UNIQUE (fee_head_id, effective_from)
);
CREATE SEQUENCE invoice_no_seq;
CREATE TABLE invoices (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_no text NOT NULL UNIQUE DEFAULT ('INV-' || lpad(nextval('invoice_no_seq')::text, 8, '0')),
  student_id uuid NOT NULL REFERENCES students(user_id),
  academic_year_id uuid NOT NULL REFERENCES academic_years(id),
  due_date date NOT NULL,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','cancelled')),
  LIKE _tpl_ts INCLUDING DEFAULTS
);
-- Charges are positive. Fines are charges. Waivers and scholarships are negative.
CREATE TABLE invoice_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id uuid NOT NULL REFERENCES invoices(id),
  fee_head_id uuid NOT NULL REFERENCES fee_heads(id),
  kind text NOT NULL CHECK (kind IN ('charge','fine','waiver','scholarship')),
  description text,
  amount numeric(12,2) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK ((kind IN ('charge','fine') AND amount >= 0) OR (kind IN ('waiver','scholarship') AND amount <= 0))
);
CREATE TABLE payments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id uuid NOT NULL REFERENCES students(user_id),
  payer_user_id uuid NOT NULL REFERENCES users(id),
  amount numeric(12,2) NOT NULL CHECK (amount > 0),
  method text NOT NULL CHECK (method IN ('upi','card','netbanking','cash','dd','cheque')),
  gateway text,
  gateway_order_id text,
  gateway_txn_id text,
  status text NOT NULL DEFAULT 'initiated'
    CHECK (status IN ('initiated','pending','success','failed','refunded','partly_refunded')),
  idempotency_key text NOT NULL UNIQUE,         -- stops double payment on retry
  paid_at timestamptz,
  entered_by uuid REFERENCES users(id),         -- set for office (offline) payments
  LIKE _tpl_ts INCLUDING DEFAULTS
);
CREATE UNIQUE INDEX uq_payment_gateway_txn ON payments (gateway, gateway_txn_id) WHERE gateway_txn_id IS NOT NULL;
CREATE TABLE payment_allocations (
  payment_id uuid NOT NULL REFERENCES payments(id),
  invoice_id uuid NOT NULL REFERENCES invoices(id),
  amount numeric(12,2) NOT NULL CHECK (amount > 0),
  PRIMARY KEY (payment_id, invoice_id)
);
CREATE TABLE gateway_events (                    -- raw webhooks, kept for audit and replay
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  provider text NOT NULL,
  provider_event_id text NOT NULL,
  payload jsonb NOT NULL,
  signature_valid boolean NOT NULL,
  processed_at timestamptz,
  received_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (provider, provider_event_id)
);
CREATE TABLE refunds (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  payment_id uuid NOT NULL REFERENCES payments(id),
  amount numeric(12,2) NOT NULL CHECK (amount > 0),
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'requested' CHECK (status IN ('requested','approved','rejected','processed','failed')),
  requested_by uuid NOT NULL REFERENCES users(id),
  approved_by uuid REFERENCES users(id),
  gateway_refund_id text,
  processed_at timestamptz,
  LIKE _tpl_ts INCLUDING DEFAULTS,
  CHECK (approved_by IS DISTINCT FROM requested_by)
);
CREATE TABLE waiver_requests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id uuid NOT NULL REFERENCES invoices(id),
  amount numeric(12,2) NOT NULL CHECK (amount > 0),
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  requested_by uuid NOT NULL REFERENCES users(id),
  approved_by uuid REFERENCES users(id),
  decided_at timestamptz,
  LIKE _tpl_ts INCLUDING DEFAULTS,
  CHECK (approved_by IS DISTINCT FROM requested_by)
);
CREATE TABLE scholarships (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  provider text,
  amount numeric(12,2),
  last_apply_date date,
  LIKE _tpl_sd INCLUDING DEFAULTS
);
CREATE TABLE student_scholarships (
  student_id uuid NOT NULL REFERENCES students(user_id),
  scholarship_id uuid NOT NULL REFERENCES scholarships(id),
  status text NOT NULL DEFAULT 'applied' CHECK (status IN ('applied','approved','rejected','disbursed')),
  decided_at timestamptz,
  PRIMARY KEY (student_id, scholarship_id)
);
CREATE TABLE bank_statement_lines (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  statement_date date NOT NULL,
  reference text NOT NULL,
  amount numeric(12,2) NOT NULL,
  matched_payment_id uuid REFERENCES payments(id),
  raw jsonb,
  UNIQUE (statement_date, reference, amount)
);

-- ---------- 12. Library, gym, canteen, transport ------------------------
CREATE TABLE authors (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE
);
CREATE TABLE books (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  isbn text UNIQUE,
  title text NOT NULL,
  LIKE _tpl_sd INCLUDING DEFAULTS
);
CREATE TABLE book_authors (
  book_id uuid NOT NULL REFERENCES books(id),
  author_id uuid NOT NULL REFERENCES authors(id),
  PRIMARY KEY (book_id, author_id)
);
CREATE TABLE book_copies (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  book_id uuid NOT NULL REFERENCES books(id),
  accession_no text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'available' CHECK (status IN ('available','issued','lost','damaged'))
);
CREATE TABLE book_loans (                        -- fine is computed, then posted as an invoice item
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  copy_id uuid NOT NULL REFERENCES book_copies(id),
  borrower_id uuid NOT NULL REFERENCES users(id),
  issued_at timestamptz NOT NULL DEFAULT now(),
  due_at timestamptz NOT NULL,
  returned_at timestamptz,
  CHECK (due_at > issued_at)
);
CREATE UNIQUE INDEX uq_copy_one_loan ON book_loans (copy_id) WHERE returned_at IS NULL;
CREATE TABLE book_reservations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  book_id uuid NOT NULL REFERENCES books(id),
  user_id uuid NOT NULL REFERENCES users(id),
  status text NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting','ready','fulfilled','cancelled')),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE gym_slots (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  slot_date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  capacity smallint NOT NULL CHECK (capacity > 0),
  UNIQUE (slot_date, start_time),
  CHECK (end_time > start_time)
);
CREATE TABLE gym_bookings (                      -- app locks the slot row (SELECT ... FOR UPDATE) to enforce capacity
  slot_id uuid NOT NULL REFERENCES gym_slots(id),
  user_id uuid NOT NULL REFERENCES users(id),
  status text NOT NULL DEFAULT 'booked' CHECK (status IN ('booked','cancelled','attended','no_show')),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (slot_id, user_id)
);
CREATE TABLE canteen_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id uuid REFERENCES vendors(id),
  name text NOT NULL,
  price numeric(12,2) NOT NULL,
  is_available boolean NOT NULL DEFAULT true,
  LIKE _tpl_sd INCLUDING DEFAULTS
);
CREATE TABLE transport_routes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  vendor_id uuid REFERENCES vendors(id)
);
CREATE TABLE route_stops (
  route_id uuid NOT NULL REFERENCES transport_routes(id),
  stop_no smallint NOT NULL,
  stop_name text NOT NULL,
  latitude numeric(9,6) NOT NULL,
  longitude numeric(9,6) NOT NULL,
  scheduled_time time NOT NULL,
  PRIMARY KEY (route_id, stop_no)
);
CREATE TABLE vehicles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  registration_no text NOT NULL UNIQUE,
  route_id uuid REFERENCES transport_routes(id),
  driver_user_id uuid REFERENCES users(id),
  capacity smallint NOT NULL CHECK (capacity > 0),
  LIKE _tpl_sd INCLUDING DEFAULTS
);
CREATE TABLE vehicle_locations (                 -- high volume, partitioned by month
  vehicle_id uuid NOT NULL REFERENCES vehicles(id),
  recorded_at timestamptz NOT NULL,
  latitude numeric(9,6) NOT NULL,
  longitude numeric(9,6) NOT NULL,
  speed_kmph numeric(5,1),
  PRIMARY KEY (vehicle_id, recorded_at)
) PARTITION BY RANGE (recorded_at);
CREATE TABLE vehicle_locations_default PARTITION OF vehicle_locations DEFAULT;

-- ---------- 13. Notices and notifications -------------------------------
CREATE TABLE notices (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  body text NOT NULL,
  created_by uuid NOT NULL REFERENCES users(id),
  is_emergency boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft','pending_approval','published','recalled')),
  approved_by uuid REFERENCES users(id),
  published_at timestamptz,
  recalled_at timestamptz,
  LIKE _tpl_sd INCLUDING DEFAULTS
);
CREATE TABLE notice_audiences (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  notice_id uuid NOT NULL REFERENCES notices(id),
  audience_type text NOT NULL CHECK (audience_type IN ('all','role','department','batch','section','hostel','user')),
  audience_id uuid,
  CHECK ((audience_type = 'all') = (audience_id IS NULL))
);
CREATE TABLE notice_attachments (
  notice_id uuid NOT NULL REFERENCES notices(id),
  file_id uuid NOT NULL REFERENCES files(id),
  PRIMARY KEY (notice_id, file_id)
);
CREATE TABLE notice_reads (
  notice_id uuid NOT NULL REFERENCES notices(id),
  user_id uuid NOT NULL REFERENCES users(id),
  read_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (notice_id, user_id)
);
CREATE TABLE message_templates (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  code text NOT NULL,
  channel text NOT NULL CHECK (channel IN ('push','sms','email','call')),
  language text NOT NULL CHECK (language IN ('en','hi','or')),
  version integer NOT NULL DEFAULT 1,
  subject text,
  body text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  UNIQUE (code, channel, language, version)
);
CREATE TABLE notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id),
  kind text NOT NULL,                            -- outpass_approved, fee_due, sos ...
  title text NOT NULL,
  body text NOT NULL,
  ref_type text,
  ref_id uuid,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
-- Fallback chain: push, then SMS, then call. One row per try.
CREATE TABLE notification_deliveries (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  notification_id uuid NOT NULL REFERENCES notifications(id),
  channel text NOT NULL CHECK (channel IN ('push','sms','email','call')),
  attempt_no smallint NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','sent','delivered','failed','read')),
  provider_message_id text,
  failure_reason text,
  sent_at timestamptz,
  delivered_at timestamptz,
  UNIQUE (notification_id, channel, attempt_no)
);
CREATE TABLE notification_preferences (
  user_id uuid NOT NULL REFERENCES users(id),
  kind text NOT NULL,
  channel text NOT NULL CHECK (channel IN ('push','sms','email','call')),
  is_enabled boolean NOT NULL DEFAULT true,
  PRIMARY KEY (user_id, kind, channel)
);
CREATE TABLE user_quiet_hours (
  user_id uuid PRIMARY KEY REFERENCES users(id),
  quiet_start time NOT NULL,
  quiet_end time NOT NULL
);
CREATE TABLE push_tokens (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id uuid NOT NULL REFERENCES user_devices(id),
  token text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE messages (                          -- official chat with set reply hours
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id uuid NOT NULL REFERENCES users(id),
  recipient_id uuid NOT NULL REFERENCES users(id),
  body text NOT NULL,
  sent_at timestamptz NOT NULL DEFAULT now(),
  read_at timestamptz,
  CHECK (sender_id <> recipient_id)
);

-- ---------- 14. Documents and certificates ------------------------------
CREATE TABLE document_templates (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  code text NOT NULL,
  version integer NOT NULL DEFAULT 1,
  body text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  UNIQUE (code, version)
);
CREATE TABLE document_types (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  code text NOT NULL UNIQUE,                     -- bonafide, bort, transfer, transcript
  name text NOT NULL,
  template_id uuid REFERENCES document_templates(id),
  fee_amount numeric(12,2) NOT NULL DEFAULT 0,
  needs_approval boolean NOT NULL DEFAULT true,
  sla_days smallint NOT NULL DEFAULT 3
);
CREATE TABLE document_requests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id uuid NOT NULL REFERENCES users(id),
  subject_user_id uuid NOT NULL REFERENCES users(id),
  document_type_id uuid NOT NULL REFERENCES document_types(id),
  purpose text,
  status text NOT NULL DEFAULT 'requested'
    CHECK (status IN ('requested','in_review','approved','rejected','issued','cancelled')),
  decided_by uuid REFERENCES users(id),
  decided_at timestamptz,
  reject_reason text,
  LIKE _tpl_ts INCLUDING DEFAULTS
);
CREATE TABLE issued_documents (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id uuid REFERENCES document_requests(id),
  document_type_id uuid NOT NULL REFERENCES document_types(id),
  subject_user_id uuid NOT NULL REFERENCES users(id),
  verify_code text NOT NULL UNIQUE,              -- printed as QR for public verification
  file_id uuid NOT NULL REFERENCES files(id),
  issued_by uuid REFERENCES users(id),
  issued_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz,
  revoke_reason text
);
CREATE TABLE no_dues_clearances (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id uuid NOT NULL REFERENCES students(user_id),
  department_id uuid NOT NULL REFERENCES departments(id),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','cleared','blocked')),
  remarks text,
  cleared_by uuid REFERENCES users(id),
  cleared_at timestamptz,
  UNIQUE (student_id, department_id)
);
CREATE TABLE alumni_profiles (
  user_id uuid PRIMARY KEY REFERENCES users(id),
  graduation_year smallint NOT NULL,
  current_employer text,
  current_title text,
  is_public boolean NOT NULL DEFAULT false,
  LIKE _tpl_ts INCLUDING DEFAULTS
);

-- ---------- 15. Activities and placements --------------------------------
CREATE TABLE clubs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  advisor_id uuid REFERENCES staff(user_id),
  LIKE _tpl_sd INCLUDING DEFAULTS
);
CREATE TABLE club_members (
  club_id uuid NOT NULL REFERENCES clubs(id),
  user_id uuid NOT NULL REFERENCES users(id),
  member_role text NOT NULL DEFAULT 'member',
  PRIMARY KEY (club_id, user_id)
);
CREATE TABLE events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  club_id uuid REFERENCES clubs(id),
  title text NOT NULL,
  description text,
  kind text NOT NULL CHECK (kind IN ('competition','hackathon','workshop','cultural','sports','other')),
  venue_location_id uuid REFERENCES locations(id),
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  registration_deadline timestamptz,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','cancelled','done')),
  approved_by uuid REFERENCES users(id),
  LIKE _tpl_sd INCLUDING DEFAULTS,
  CHECK (ends_at > starts_at)
);
CREATE TABLE event_registrations (
  event_id uuid NOT NULL REFERENCES events(id),
  user_id uuid NOT NULL REFERENCES users(id),
  status text NOT NULL DEFAULT 'registered' CHECK (status IN ('registered','cancelled','attended')),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (event_id, user_id)
);
CREATE TABLE teams (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id uuid NOT NULL REFERENCES events(id),
  name text NOT NULL,
  created_by uuid NOT NULL REFERENCES users(id),
  UNIQUE (event_id, name)
);
CREATE TABLE team_members (
  team_id uuid NOT NULL REFERENCES teams(id),
  user_id uuid NOT NULL REFERENCES users(id),
  PRIMARY KEY (team_id, user_id)
);
CREATE TABLE event_awards (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id uuid NOT NULL REFERENCES events(id),
  user_id uuid NOT NULL REFERENCES users(id),
  award text NOT NULL,                           -- participant, winner, runner-up
  issued_document_id uuid REFERENCES issued_documents(id),
  UNIQUE (event_id, user_id, award)
);
CREATE TABLE companies (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  website text
);
CREATE TABLE placement_drives (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id uuid NOT NULL REFERENCES companies(id),
  role_title text NOT NULL,
  drive_date date,
  last_apply_date date,
  min_cgpa numeric(4,2) CHECK (min_cgpa BETWEEN 0 AND 10),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','closed','done','cancelled')),
  LIKE _tpl_sd INCLUDING DEFAULTS
);
CREATE TABLE drive_eligible_courses (
  drive_id uuid NOT NULL REFERENCES placement_drives(id),
  course_id uuid NOT NULL REFERENCES courses(id),
  PRIMARY KEY (drive_id, course_id)
);
CREATE TABLE drive_applications (
  drive_id uuid NOT NULL REFERENCES placement_drives(id),
  student_id uuid NOT NULL REFERENCES students(user_id),
  status text NOT NULL DEFAULT 'applied' CHECK (status IN ('applied','shortlisted','selected','rejected','withdrawn')),
  applied_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (drive_id, student_id)
);

-- ---------- 16. Safety, health and discipline ---------------------------
CREATE TABLE emergency_directory (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  kind text NOT NULL CHECK (kind IN ('ambulance','nurse','security','fire','hospital','helpline','other')),
  name text NOT NULL,
  phone text NOT NULL,
  hostel_id uuid REFERENCES hostels(id),
  sort_order smallint NOT NULL DEFAULT 1
);
CREATE TABLE sos_escalation_steps (              -- who is alerted, in order
  step_no smallint PRIMARY KEY CHECK (step_no > 0),
  role_id uuid REFERENCES roles(id),
  emergency_directory_id uuid REFERENCES emergency_directory(id),
  wait_seconds integer NOT NULL DEFAULT 120 CHECK (wait_seconds > 0),
  CHECK (num_nonnulls(role_id, emergency_directory_id) = 1)
);
CREATE TABLE sos_incidents (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id uuid NOT NULL REFERENCES students(user_id),
  triggered_by uuid NOT NULL REFERENCES users(id),     -- student, roommate or faculty
  source text NOT NULL CHECK (source IN ('button','shake','roommate','faculty','guard')),
  latitude numeric(9,6),
  longitude numeric(9,6),
  location_id uuid REFERENCES locations(id),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','acknowledged','escalated','closed','false_alarm')),
  idempotency_key text NOT NULL UNIQUE,
  closed_by uuid REFERENCES users(id),
  closed_at timestamptz,
  closure_report text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE sos_alerts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  incident_id uuid NOT NULL REFERENCES sos_incidents(id),
  step_no smallint NOT NULL REFERENCES sos_escalation_steps(step_no),
  recipient_user_id uuid REFERENCES users(id),
  recipient_directory_id uuid REFERENCES emergency_directory(id),
  notified_at timestamptz NOT NULL DEFAULT now(),
  acknowledged_at timestamptz,
  CHECK (num_nonnulls(recipient_user_id, recipient_directory_id) = 1)
);
CREATE TABLE sos_updates (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  incident_id uuid NOT NULL REFERENCES sos_incidents(id),
  author_id uuid NOT NULL REFERENCES users(id),
  body text NOT NULL,
  visible_to_guardian boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
-- Sensitive: restrict to nurse, doctor and the student only
CREATE TABLE medical_visits (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id uuid NOT NULL REFERENCES students(user_id),
  visit_kind text NOT NULL CHECK (visit_kind IN ('clinic','hospital')),
  visited_at timestamptz NOT NULL,
  handled_by uuid REFERENCES users(id),
  slip_file_id uuid REFERENCES files(id),
  leave_request_id uuid REFERENCES leave_requests(id),
  created_at timestamptz NOT NULL DEFAULT now()
);
-- Anonymous reports have NO reporter column on purpose.
CREATE TABLE anonymous_reports (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  token_hash text NOT NULL UNIQUE,               -- reporter keeps the token to check status
  category text NOT NULL CHECK (category IN ('ragging','harassment','safety','faculty','other')),
  body text NOT NULL,
  location_id uuid REFERENCES locations(id),
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new','in_review','action_taken','closed')),
  assigned_to uuid REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE safety_cases (                      -- named complaints, committee only
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  case_no text NOT NULL UNIQUE,
  category text NOT NULL CHECK (category IN ('ragging','harassment','faculty','discipline','other')),
  complainant_id uuid REFERENCES users(id),
  respondent_id uuid REFERENCES users(id),
  source_report_id uuid REFERENCES anonymous_reports(id),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','hearing','decided','closed')),
  summary text,
  LIKE _tpl_ts INCLUDING DEFAULTS
);
CREATE TABLE case_responses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id uuid NOT NULL REFERENCES safety_cases(id),
  author_id uuid NOT NULL REFERENCES users(id),
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE case_access_log (                   -- who opened which case
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id uuid REFERENCES safety_cases(id),
  report_id uuid REFERENCES anonymous_reports(id),
  user_id uuid NOT NULL REFERENCES users(id),
  action text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (num_nonnulls(case_id, report_id) = 1)
);
CREATE TABLE counselling_bookings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id uuid NOT NULL REFERENCES students(user_id),
  counsellor_id uuid NOT NULL REFERENCES staff(user_id),
  slot_start timestamptz NOT NULL,
  slot_end timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'booked' CHECK (status IN ('booked','done','cancelled','no_show')),
  referred_by uuid REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (slot_end > slot_start),
  EXCLUDE USING gist (counsellor_id WITH =, tstzrange(slot_start, slot_end) WITH &&)
    WHERE (status = 'booked')
);
CREATE TABLE warnings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id uuid NOT NULL REFERENCES students(user_id),
  issued_by uuid NOT NULL REFERENCES users(id),
  kind text NOT NULL CHECK (kind IN ('warning','fine','meeting_call','suspension')),
  reason text NOT NULL,
  invoice_item_id uuid REFERENCES invoice_items(id),
  guardian_notified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
-- Anonymous faculty feedback: "who submitted" is split from "what was said"
CREATE TABLE feedback_submissions (
  offering_id uuid NOT NULL REFERENCES subject_offerings(id),
  student_id uuid NOT NULL REFERENCES students(user_id),
  submitted_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (offering_id, student_id)
);
CREATE TABLE feedback_responses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  offering_id uuid NOT NULL REFERENCES subject_offerings(id),
  rating smallint NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ---------- 17. System: audit, privacy, rules ---------------------------
CREATE TABLE audit_logs (                        -- append-only, partitioned by month
  id bigint GENERATED ALWAYS AS IDENTITY,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  actor_user_id uuid,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  old_values jsonb,
  new_values jsonb,
  ip_address inet,
  request_id uuid,
  PRIMARY KEY (id, occurred_at)
) PARTITION BY RANGE (occurred_at);
CREATE TABLE audit_logs_default PARTITION OF audit_logs DEFAULT;
CREATE FUNCTION block_log_changes() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN RAISE EXCEPTION 'Log table % is append-only', TG_TABLE_NAME; END $$;
CREATE TRIGGER trg_audit_immutable BEFORE UPDATE OR DELETE ON audit_logs
  FOR EACH ROW EXECUTE FUNCTION block_log_changes();
CREATE TRIGGER trg_case_log_immutable BEFORE UPDATE OR DELETE ON case_access_log
  FOR EACH ROW EXECUTE FUNCTION block_log_changes();

CREATE TABLE data_access_logs (                  -- who viewed whose data
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  viewer_id uuid NOT NULL REFERENCES users(id),
  subject_user_id uuid NOT NULL REFERENCES users(id),
  resource text NOT NULL,
  viewed_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE user_consents (
  user_id uuid NOT NULL REFERENCES users(id),
  consent_type text NOT NULL,                    -- privacy_policy, data_sharing
  version text NOT NULL,
  granted_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz,
  PRIMARY KEY (user_id, consent_type, version)
);
CREATE TABLE idempotency_keys (
  scope text NOT NULL,
  key text NOT NULL,
  request_hash text NOT NULL,
  response_body jsonb,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (scope, key)
);
CREATE TABLE system_rules (                      -- versioned rules: fine, attendance, outpass limits
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  rule_key text NOT NULL,
  version integer NOT NULL,
  value jsonb NOT NULL,
  effective_from date NOT NULL,
  created_by uuid NOT NULL REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (rule_key, version)
);
CREATE TABLE feature_flags (
  flag_key text PRIMARY KEY,
  is_enabled boolean NOT NULL DEFAULT false,
  rollout_percent smallint NOT NULL DEFAULT 0 CHECK (rollout_percent BETWEEN 0 AND 100),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE retention_policies (
  entity_type text PRIMARY KEY,
  retain_months integer NOT NULL CHECK (retain_months > 0)
);
CREATE TABLE app_config (
  config_key text PRIMARY KEY,                   -- min_app_version, maintenance_notice
  value text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ---------- 18. Views (derived data is never stored) --------------------
CREATE VIEW v_invoice_balance AS
SELECT i.id AS invoice_id, i.student_id, i.due_date,
       COALESCE(SUM(ii.amount), 0)                       AS total_due,
       COALESCE((SELECT SUM(pa.amount) FROM payment_allocations pa
                 JOIN payments p ON p.id = pa.payment_id AND p.status IN ('success','partly_refunded')
                 WHERE pa.invoice_id = i.id), 0)         AS total_paid
FROM invoices i
LEFT JOIN invoice_items ii ON ii.invoice_id = i.id
WHERE i.status = 'open'
GROUP BY i.id;

CREATE VIEW v_attendance_percent AS
SELECT ar.student_id, so.subject_id, so.term_id,
       COUNT(*) FILTER (WHERE ar.status IN ('present','late','on_leave'))::numeric
         / NULLIF(COUNT(*), 0) * 100 AS percent_present
FROM attendance_records ar
JOIN class_sessions cs ON cs.id = ar.session_id AND cs.status = 'held'
JOIN subject_offerings so ON so.id = cs.offering_id
GROUP BY ar.student_id, so.subject_id, so.term_id;

-- ---------- 19. Automation: triggers and FK indexes ---------------------
-- updated_at trigger on every table that has the column
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT c.table_name FROM information_schema.columns c
    JOIN information_schema.tables t
      ON t.table_schema = c.table_schema AND t.table_name = c.table_name AND t.table_type = 'BASE TABLE'
    WHERE c.table_schema = 'campus' AND c.column_name = 'updated_at'
      AND c.table_name NOT LIKE '\_tpl%'
  LOOP
    EXECUTE format('CREATE TRIGGER trg_%1$s_updated BEFORE UPDATE ON %1$I
                    FOR EACH ROW EXECUTE FUNCTION set_updated_at()', r.table_name);
  END LOOP;
END $$;

-- Index every single-column foreign key that has no index yet
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT c.conrelid::regclass AS tbl, a.attname AS col
    FROM pg_constraint c
    JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = c.conkey[1]
    WHERE c.contype = 'f' AND array_length(c.conkey, 1) = 1
      AND c.connamespace = 'campus'::regnamespace
      AND NOT EXISTS (SELECT 1 FROM pg_index i
                      WHERE i.indrelid = c.conrelid AND i.indkey[0] = c.conkey[1])
  LOOP
    EXECUTE format('CREATE INDEX ON %s (%I)', r.tbl, r.col);
  END LOOP;
END $$;

-- Extra indexes for hot queries
CREATE INDEX idx_tickets_open_sla ON tickets (sla_due_at) WHERE status NOT IN ('fixed','closed','rejected');
CREATE INDEX idx_outpass_pending ON outpass_requests (created_at) WHERE status = 'pending';
CREATE INDEX idx_notifications_unread ON notifications (user_id, created_at DESC) WHERE read_at IS NULL;
CREATE INDEX idx_attendance_student ON attendance_records (student_id);
CREATE INDEX idx_payments_student ON payments (student_id, status);
CREATE INDEX idx_audit_entity ON audit_logs (entity_type, entity_id, occurred_at DESC);
CREATE INDEX idx_vehicle_loc_latest ON vehicle_locations (vehicle_id, recorded_at DESC);

-- ---------- 20. Seed: base roles ----------------------------------------
INSERT INTO roles (code, name, is_system) VALUES
  ('student','Student',true), ('faculty','Faculty',true), ('parent','Parent',true),
  ('warden','Warden',true), ('admin','Admin',true), ('super_admin','Super Admin',true);

DROP TABLE _tpl_ts, _tpl_sd;

COMMIT;

-- ---------- Ops notes ---------------------------------------------------
-- * Create monthly partitions for audit_logs and vehicle_locations (pg_partman).
-- * App DB user: no DELETE on audit_logs, case_access_log, payments, mark_entries.
-- * Enable Row Level Security on students, mark_entries, medical_visits,
--   anonymous_reports, safety_cases, and match it to user_roles scope.
-- * Back up daily, test restore monthly. Use PITR (WAL archiving).
-- * Encrypt phone, email and file storage at rest. Hash OTP and backup codes.
