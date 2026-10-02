/**
 * Native Bun Password Hashing & Verification (Argon2id)
 * Follows KISS & DRY principles by leveraging Bun stdlib.
 */

export const hashPassword = async (password: string): Promise<string> => {
  return await Bun.password.hash(password, {
    algorithm: 'argon2id',
    memoryCost: 4096,
    timeCost: 3,
  });
};

export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return await Bun.password.verify(password, hash);
};
