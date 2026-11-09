export const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship'] as const;
export const WORK_MODES = ['Onsite', 'Remote', 'Hybrid'] as const;
export const LOCATIONS = ['Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Chennai', 'Pune', 'Remote'];

export type JobType = (typeof JOB_TYPES)[number];
export type WorkMode = (typeof WORK_MODES)[number];

/** A job as returned by the API. `isSample` marks built-in demo listings. */
export interface Job {
  id: number;
  title: string;
  companyName: string;
  location: string;
  jobType: JobType;
  workMode: WorkMode;
  experience?: string | null;
  salary?: string | null;
  salaryRange: string;
  description: string;
  applicationDeadline: string;
  createdAt: string;
  updatedAt: string;
  isSample?: boolean;
}

export interface JobFormData {
  title: string;
  companyName: string;
  location: string;
  jobType: JobType;
  workMode: WorkMode;
  experience?: string;
  salary?: string;
  salaryRange: string;
  description: string;
  /** ISO date string (YYYY-MM-DD or full ISO) */
  applicationDeadline: string;
}
