import { z } from 'zod';

export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    message: z.string().optional(),
    data: dataSchema.optional(),
    error: z.string().optional(),
    requestId: z.string().optional(),
    timestamp: z.string().optional(),
  });

export type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  requestId?: string;
  timestamp?: string;
};

// Common Domain Schemas for Contract Drift Checks
export const AuthTokenDataSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string().optional(), // Optional for Web HttpOnly cookie auth
  expiresIn: z.number().optional(),
  user: z
    .object({
      id: z.string(),
      userCode: z.string(),
      fullName: z.string(),
      email: z.string().optional(),
    })
    .optional(),
});

export type AuthTokenData = z.infer<typeof AuthTokenDataSchema>;

export const UserPermissionsSchema = z.object({
  permissions: z.array(z.string()),
});

export const UserRolesSchema = z.object({
  roles: z.array(z.string()),
});
