import { z } from 'zod';

const registerSchema = z.object({
  identity: z.string().min(3, 'Identity must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const loginSchema = z.object({
  identity: z.string().min(1, 'Identity is required'),
  password: z.string().min(1, 'Password is required'),
});

const roleRequestSchema = z.object({
  roleId: z.string().min(1, 'Role selection is required'),
  claimedCode: z.string().min(2, 'Claimed identification code is required'),
  departmentOrHostel: z.string().min(2, 'Department or Hostel is required'),
});

describe('Form Validation Zod Schemas', () => {
  it('rejects invalid register form payload', () => {
    const invalid = registerSchema.safeParse({ identity: 'ab', password: '123' });
    expect(invalid.success).toBe(false);
  });

  it('accepts valid register form payload', () => {
    const valid = registerSchema.safeParse({ identity: 'user@campus.edu', password: 'password123' });
    expect(valid.success).toBe(true);
  });

  it('rejects empty login fields', () => {
    const invalid = loginSchema.safeParse({ identity: '', password: '' });
    expect(invalid.success).toBe(false);
  });

  it('validates role request submission parameters', () => {
    const validRoleReq = roleRequestSchema.safeParse({
      roleId: 'student',
      claimedCode: 'STU999',
      departmentOrHostel: 'Computer Science',
    });
    expect(validRoleReq.success).toBe(true);
  });
});
