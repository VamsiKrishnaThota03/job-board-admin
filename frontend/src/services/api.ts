import { Job, JobFormData } from '@/types/job';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').replace(/\/+$/, '');

/** Turn a NestJS error body ({ message: string | string[] }) into a readable message. */
async function errorFrom(response: Response, fallback: string): Promise<Error> {
  try {
    const body = await response.json();
    const message = Array.isArray(body?.message) ? body.message.join('; ') : body?.message;
    if (typeof message === 'string' && message) return new Error(message);
  } catch {
    // not JSON
  }
  return new Error(`${fallback} (HTTP ${response.status})`);
}

async function request<T>(path: string, init: RequestInit | undefined, fallback: string): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    });
  } catch {
    throw new Error('Cannot reach the jobs API. Check that the backend is running.');
  }
  if (!response.ok) throw await errorFrom(response, fallback);
  if (response.status === 204) return undefined as T;
  return response.json();
}

export const jobsApi = {
  getAllJobs: () => request<Job[]>('/jobs', undefined, 'Failed to fetch jobs'),
  getJobById: (id: number) => request<Job>(`/jobs/${id}`, undefined, 'Failed to fetch job'),
  createJob: (data: JobFormData) =>
    request<Job>('/jobs', { method: 'POST', body: JSON.stringify(data) }, 'Failed to create job'),
  updateJob: (id: number, data: Partial<JobFormData>) =>
    request<Job>(`/jobs/${id}`, { method: 'PATCH', body: JSON.stringify(data) }, 'Failed to update job'),
  deleteJob: (id: number) => request<void>(`/jobs/${id}`, { method: 'DELETE' }, 'Failed to delete job'),
};
