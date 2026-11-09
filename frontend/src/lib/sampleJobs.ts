import type { Job } from '@/types/job';

const now = Date.now();
const hoursAgo = (h: number) => new Date(now - h * 3600_000).toISOString();
const inDays = (d: number) => new Date(now + d * 86400_000).toISOString();

const base = [
  ['Full Stack Developer', 'Amazon', 'Bangalore', 'Hybrid', '1-3 yrs', '12 LPA', '₹6,00,000 - ₹12,00,000'],
  ['Node.js Developer', 'Tesla', 'Mumbai', 'Remote', '2-4 yrs', '10 LPA', '₹50,000 - ₹80,000'],
  ['UX/UI Designer', 'Swiggy', 'Delhi', 'Onsite', '1-3 yrs', '8 LPA', '₹40,000 - ₹65,000'],
  ['Frontend Engineer', 'Amazon', 'Hyderabad', 'Onsite', '0-2 yrs', '7 LPA', '₹35,000 - ₹55,000'],
  ['Data Analyst Intern', 'Swiggy', 'Bangalore', 'Hybrid', 'Fresher', '', '₹20,000 - ₹30,000'],
  ['DevOps Engineer', 'Tesla', 'Pune', 'Remote', '3-5 yrs', '18 LPA', '₹12,00,000 - ₹18,00,000'],
] as const;

/**
 * Demo listings shown only when the API cannot be reached, so the UI is never empty
 * on a cold start. They use negative ids and cannot be edited.
 */
export const sampleJobs: Job[] = base.map(([title, companyName, location, workMode, experience, salary, salaryRange], i) => ({
  id: -(i + 1),
  title,
  companyName,
  location,
  workMode,
  jobType: i === 4 ? 'Internship' : 'Full-time',
  experience,
  salary,
  salaryRange,
  description:
    'Build features end to end with a small product team. Review code, write tests and help improve our tooling. Work closely with design to ship polished experiences.',
  applicationDeadline: inDays(14 + i),
  createdAt: hoursAgo(2 + i * 7),
  updatedAt: hoursAgo(2 + i * 7),
  isSample: true,
}));
