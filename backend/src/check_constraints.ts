import { prisma } from './config/prisma';

async function run() {
  const rows: any = await prisma.$queryRaw`
    SELECT conname, pg_get_constraintdef(oid) 
    FROM pg_constraint 
    WHERE conrelid = 'campus.user_roles'::regclass;
  `;
  console.log('user_roles constraints:', rows);
}
run().catch(console.error).finally(() => prisma.$disconnect());
