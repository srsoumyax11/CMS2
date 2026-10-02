# Project Rules & Workspace Guidelines

## Tech Stack
- **Frontend**: React Native + Expo (TypeScript)
- **Backend**: Bun + ElysiaJS (TypeScript)
- **Database & Auth**: Supabase (Local Docker via CLI) + Prisma ORM
- **API Documentation**: `@elysiajs/swagger` at `/swagger`

## Development Conventions
1. Always run backend commands inside the `backend/` directory.
2. Keep `prisma/schema.prisma` in sync with PostgreSQL. Whenever `schema.prisma` is modified, run `bunx prisma generate` and `bunx prisma db push`.
3. Use strict TypeScript types and explicit error handling across backend and frontend code.
4. Maintain `common_cmd.md` whenever new workflows or setup steps are added.
