import type { ApplicationStatus, JobType } from './types';

export const jobTypeLabels: Record<JobType, string> = {
  Internship: 'Internship',
  FullTime: 'Full-time',
  PartTime: 'Part-time'
};

export const statusLabels: Record<ApplicationStatus, string> = {
  Applied: 'Applied',
  Interviewing: 'Interviewing',
  Offer: 'Offer',
  Rejected: 'Rejected'
};

export function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(new Date(value));
}

export function toDateInputValue(value: string) {
  return new Date(value).toISOString().slice(0, 10);
}
