-- AlterTable
ALTER TABLE "campus"."role_requests" ADD COLUMN IF NOT EXISTS "claimed_roll_no" TEXT;
ALTER TABLE "campus"."role_requests" ADD COLUMN IF NOT EXISTS "claimed_registration_no" TEXT;
ALTER TABLE "campus"."role_requests" ADD COLUMN IF NOT EXISTS "claimed_course_id" UUID;
ALTER TABLE "campus"."role_requests" ADD COLUMN IF NOT EXISTS "claimed_course_text" TEXT;
ALTER TABLE "campus"."role_requests" ADD COLUMN IF NOT EXISTS "claimed_admission_year" INTEGER;
ALTER TABLE "campus"."role_requests" ADD COLUMN IF NOT EXISTS "claimed_employee_code" TEXT;
