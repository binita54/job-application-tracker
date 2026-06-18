import { z } from 'zod';

export const jobTypes = ['Internship', 'FullTime', 'PartTime'] as const;
export const statuses = ['Applied', 'Interviewing', 'Offer', 'Rejected'] as const;

const dateSchema = z.coerce.date().refine((date) => !Number.isNaN(date.getTime()), {
  message: 'Applied date must be a valid date.'
});

export const applicationCreateSchema = z.object({
  companyName: z.string().trim().min(2, 'Company name must be at least 2 characters.'),
  jobTitle: z.string().trim().min(1, 'Job title is required.'),
  jobType: z.enum(jobTypes),
  status: z.enum(statuses),
  appliedDate: dateSchema,
  notes: z.string().trim().optional().nullable().transform((value) => value || null)
});

export const applicationUpdateSchema = applicationCreateSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  { message: 'At least one field is required for update.' }
);

export const applicationQuerySchema = z.object({
  status: z.enum(statuses).optional(),
  search: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20)
});

export type ApplicationQuery = z.infer<typeof applicationQuerySchema>;
