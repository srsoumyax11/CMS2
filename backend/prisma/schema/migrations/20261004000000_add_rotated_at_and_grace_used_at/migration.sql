-- AlterTable
ALTER TABLE "campus"."auth_sessions" ADD COLUMN IF NOT EXISTS "rotated_at" TIMESTAMPTZ(6);
ALTER TABLE "campus"."auth_sessions" ADD COLUMN IF NOT EXISTS "grace_used_at" TIMESTAMPTZ(6);
