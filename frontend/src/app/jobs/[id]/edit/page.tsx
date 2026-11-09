'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Alert, Paper, Skeleton } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconArrowLeft } from '@tabler/icons-react';
import { Header } from '@/components/Header';
import { JobForm, fromJob } from '@/components/JobForm';
import { Job, JobFormData } from '@/types/job';
import { jobsApi } from '@/services/api';

export default function EditJobPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const jobId = Number(id);
  const [job, setJob] = useState<Job | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!Number.isInteger(jobId) || jobId <= 0) {
      setError('Invalid job id');
      return;
    }
    jobsApi
      .getJobById(jobId)
      .then(setJob)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load job'));
  }, [jobId]);

  const handleSubmit = async (data: JobFormData) => {
    try {
      await jobsApi.updateJob(jobId, data);
      notifications.show({ title: 'Job updated', message: data.title, color: 'green' });
      router.push('/');
    } catch (e) {
      notifications.show({ title: 'Could not update job', message: e instanceof Error ? e.message : 'Unexpected error', color: 'red' });
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 pb-16">
      <Header />
      <div className="mx-auto mt-8 w-full max-w-3xl px-4">
        <Link href="/" className="mb-4 inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900">
          <IconArrowLeft size={16} aria-hidden="true" /> Back to jobs
        </Link>
        <h1 className="mb-6 text-2xl font-semibold text-gray-900">Edit job posting</h1>
        <Paper radius="lg" p="xl" withBorder>
          {error ? (
            <Alert color="red" title="Job not available">
              {error}
            </Alert>
          ) : !job ? (
            <div className="space-y-4">
              <Skeleton height={40} />
              <Skeleton height={40} />
              <Skeleton height={120} />
            </div>
          ) : (
            <JobForm initial={fromJob(job)} submitLabel="Save changes" onSubmit={handleSubmit} onCancel={() => router.push('/')} />
          )}
        </Paper>
      </div>
    </main>
  );
}
