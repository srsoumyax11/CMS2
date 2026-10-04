import { z } from 'zod';

export const triggerSosSchema = z.object({
  emergencyType: z.enum(['MEDICAL', 'SECURITY', 'FIRE', 'OTHER']),
  location: z.string().min(3, 'Location is required (e.g. Block A Room 204)'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  note: z.string().optional(),
});

export type TriggerSosFormValues = z.infer<typeof triggerSosSchema>;
