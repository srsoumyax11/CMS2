import { prisma } from './config/prisma';

async function run() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS campus.pre_registered_identities (
      id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
      user_code text NOT NULL UNIQUE,
      expected_role_code text NOT NULL,
      full_name text NOT NULL,
      email text,
      phone text,
      department_id uuid REFERENCES campus.departments(id),
      batch_id uuid REFERENCES campus.batches(id),
      is_claimed boolean NOT NULL DEFAULT false,
      claimed_by_user_id uuid REFERENCES campus.users(id),
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );
  `);
  console.log('pre_registered_identities created in campus schema');
}
run().catch(console.error).finally(() => prisma.$disconnect());
