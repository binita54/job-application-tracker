import { describe, expect, it } from 'vitest';
import { applicationCreateSchema, applicationUpdateSchema } from '../server/src/schemas';

describe('application validation', () => {
  it('accepts a valid application payload', () => {
    const result = applicationCreateSchema.safeParse({
      companyName: 'InternSathi',
      jobTitle: 'Full Stack Intern',
      jobType: 'Internship',
      status: 'Applied',
      appliedDate: '2026-06-18',
      notes: ''
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.notes).toBeNull();
    }
  });

  it('rejects a short company name', () => {
    const result = applicationCreateSchema.safeParse({
      companyName: 'A',
      jobTitle: 'Developer',
      jobType: 'FullTime',
      status: 'Interviewing',
      appliedDate: '2026-06-18'
    });

    expect(result.success).toBe(false);
  });

  it('requires at least one field for partial updates', () => {
    const result = applicationUpdateSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
