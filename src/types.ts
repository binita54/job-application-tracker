export const jobTypes = ['Internship', 'FullTime', 'PartTime'] as const;
export const statuses = ['Applied', 'Interviewing', 'Offer', 'Rejected'] as const;

export type JobType = (typeof jobTypes)[number];
export type ApplicationStatus = (typeof statuses)[number];

export type Application = {
  id: string;
  companyName: string;
  jobTitle: string;
  jobType: JobType;
  status: ApplicationStatus;
  appliedDate: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ApplicationPayload = {
  companyName: string;
  jobTitle: string;
  jobType: JobType;
  status: ApplicationStatus;
  appliedDate: string;
  notes?: string | null;
};

export type ApplicationListResponse = {
  items: Application[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};
