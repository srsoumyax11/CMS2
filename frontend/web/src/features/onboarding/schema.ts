import { z } from 'zod';

export const studentRoleSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  rollNumber: z.string().min(1, 'Roll number is required'),
  registrationNumber: z.string().min(1, 'Registration number is required'),
  department: z.string().min(1, 'Department is required'),
  course: z.string().min(1, 'Course is required'),
  admissionYear: z.number().min(2000, 'Admission year must be at least 2000').max(2030),
  evidenceUrl: z.string().optional(),
});

export type StudentRoleFormData = z.infer<typeof studentRoleSchema>;

export const facultyRoleSchema = z.object({
  employeeCode: z.string().min(1, 'Employee code is required'),
  department: z.string().min(1, 'Department is required'),
  evidenceUrl: z.string().optional(),
});

export type FacultyRoleFormData = z.infer<typeof facultyRoleSchema>;

export const wardenRoleSchema = z.object({
  employeeCode: z.string().min(1, 'Employee code is required'),
  hostelName: z.string().min(1, 'Hostel name is required'),
  evidenceUrl: z.string().optional(),
});

export type WardenRoleFormData = z.infer<typeof wardenRoleSchema>;

export const parentLinkFormSchema = z.object({
  admissionNumber: z.string().min(1, 'Student admission number is required'),
  studentDob: z.string().min(1, 'Student date of birth is required'),
  relation: z.string().min(1, 'Relation (e.g. Father, Mother, Guardian) is required'),
});

export type ParentLinkFormData = z.infer<typeof parentLinkFormSchema>;
