import { prisma } from './config/prisma';

async function run() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS campus.emergency_contacts (
      id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id uuid NOT NULL REFERENCES campus.users(id) ON DELETE CASCADE,
      name text NOT NULL,
      relation text NOT NULL,
      phone text NOT NULL,
      alternate_phone text,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );
  `);
  console.log('emergency_contacts table created successfully in campus schema!');
}
run().catch(console.error).finally(() => prisma.$disconnect());
