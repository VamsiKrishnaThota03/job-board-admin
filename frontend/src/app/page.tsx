'use client';

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Alert, Button, Skeleton } from '@mantine/core';
import { IconInfoCircle, IconMoodEmpty } from '@tabler/icons-react';
import { Header } from '@/components/Header';
import { SearchFilters, Filters, defaultFilters, SALARY_MAX_K } from '@/components/SearchFilters';
import { JobCard } from '@/components/JobCard';
import { CreateJobModal } from '@/components/CreateJobModal';
import { JobDetailsModal } from '@/components/JobDetailsModal';
import { Job } from '@/types/job';
import { jobsApi } from '@/services/api';
import { monthlySalary } from '@/lib/format';
import { sampleJobs } from '@/lib/sampleJobs';

function matches(job: Job, f: Filters): boolean {
  const q = f.search.trim().toLowerCase();
  if (q && !`${job.title} ${job.companyName}`.toLowerCase().includes(q)) return false;
  if (f.location && job.location !== f.location) return false;
  if (f.jobType && job.jobType !== f.jobType) return false;

  const [minK, maxK] = f.salaryRange;
  if (minK > 0 || maxK < SALARY_MAX_K) {
    const monthly = monthlySalary(job.salary, job.salaryRange);
    if (monthly === null) return false;
    if (monthly < minK * 1000) return false;
    if (maxK < SALARY_MAX_K && monthly > maxK * 1000) return false;
  }
  return true;
}

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const showCreateModal = searchParams.get('create') === 'true';

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [selected, setSelected] = useState<Job | null>(null);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      setJobs(await jobsApi.getAllJobs());
      setApiError(null);
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Could not load jobs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // Sample listings keep the page useful when the API is down (e.g. a sleeping free-tier host)
  const source = apiError ? sampleJobs : jobs;
  const filtered = useMemo(() => source.filter((job) => matches(job, filters)), [source, filters]);
  const isFiltered = JSON.stringify(filters) !== JSON.stringify(defaultFilters);

  return (
    <main className="min-h-screen bg-white pb-16">
      <Header />
      <SearchFilters filters={filters} onChange={setFilters} />

      <section className="mx-auto mt-8 w-full max-w-7xl px-4" aria-live="polite">
        {apiError && (
          <Alert
            icon={<IconInfoCircle />}
            color="blue"
            radius="md"
            mb="lg"
            title="Showing sample listings"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span>{apiError}</span>
              <Button size="xs" variant="white" color="dark" onClick={fetchJobs} loading={loading}>
                Retry
              </Button>
            </div>
          </Alert>
        )}

        {!loading && (
          <p className="mb-4 text-sm text-gray-500">
            {filtered.length} {filtered.length === 1 ? 'job' : 'jobs'}
            {isFiltered ? ' match your filters' : ''}
          </p>
        )}

        {loading && jobs.length === 0 && !apiError ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }, (_, i) => (
              <Skeleton key={i} height={330} radius="lg" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="mx-auto max-w-md rounded-2xl border-2 border-dashed border-gray-200 p-10 text-center">
            <IconMoodEmpty size={40} className="mx-auto text-gray-400" aria-hidden="true" />
            <h2 className="mt-3 text-lg font-semibold text-gray-900">
              {isFiltered ? 'No jobs match these filters' : 'No jobs posted yet'}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {isFiltered ? 'Try widening the salary range or clearing a filter.' : 'Create the first opening to get started.'}
            </p>
            <Button
              mt="lg"
              radius="xl"
              color="violet"
              onClick={() => (isFiltered ? setFilters(defaultFilters) : router.push('/?create=true', { scroll: false }))}
            >
              {isFiltered ? 'Clear filters' : 'Create job'}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((job) => (
              <JobCard key={job.id} job={job} onOpen={setSelected} />
            ))}
          </div>
        )}
      </section>

      <CreateJobModal opened={showCreateModal} onClose={() => router.push('/', { scroll: false })} onCreated={fetchJobs} />
      <JobDetailsModal
        job={selected}
        onClose={() => setSelected(null)}
        onDeleted={(id) => setJobs((prev) => prev.filter((j) => j.id !== id))}
      />
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={null}>
      <HomeContent />
    </Suspense>
  );
}
