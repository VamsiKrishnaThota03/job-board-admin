'use client';

import { Badge, Button } from '@mantine/core';
import { IconBriefcase, IconBuilding, IconCurrencyRupee, IconMapPin } from '@tabler/icons-react';
import { Job } from '@/types/job';
import { timeAgo } from '@/lib/format';
import { CompanyLogo } from './CompanyLogo';

interface JobCardProps {
  job: Job;
  onOpen: (job: Job) => void;
}

export function JobCard({ job, onOpen }: JobCardProps) {
  const points = job.description
    .split(/(?<=[.!?])\s+/)
    .map((p) => p.trim())
    .filter(Boolean)
    .slice(0, 2);

  return (
    <article className="flex h-full flex-col rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_0_14px_rgba(211,211,211,0.15)] transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="mb-4 flex items-start justify-between">
        <CompanyLogo name={job.companyName} />
        <Badge radius="md" size="md" variant="light" color="blue" tt="none">
          {job.isSample ? 'Sample' : timeAgo(job.createdAt)}
        </Badge>
      </div>

      <h3 className="text-[17px] font-bold leading-snug text-gray-900">{job.title}</h3>
      <p className="mb-3 text-sm text-gray-500">
        {job.companyName} · {job.location}
      </p>

      <ul className="mb-3 flex flex-wrap gap-x-4 gap-y-1.5 text-[13px] font-medium text-gray-600">
        <li className="flex items-center gap-1">
          <IconBriefcase size={15} aria-hidden="true" /> {job.experience || 'Any experience'}
        </li>
        <li className="flex items-center gap-1">
          {job.workMode === 'Remote' ? <IconMapPin size={15} aria-hidden="true" /> : <IconBuilding size={15} aria-hidden="true" />}
          {job.workMode}
        </li>
        <li className="flex items-center gap-1">
          <IconCurrencyRupee size={15} aria-hidden="true" /> {job.salary || job.salaryRange}
        </li>
      </ul>

      <ul className="mb-4 flex-1 space-y-1 text-[13px] leading-relaxed text-gray-500">
        {(points.length ? points : ['No description provided.']).map((p, i) => (
          <li key={i} className="flex gap-2">
            <span aria-hidden="true" className="text-gray-400">•</span>
            <span className="line-clamp-2">{p}</span>
          </li>
        ))}
      </ul>

      <Button fullWidth radius="md" color="blue" onClick={() => onOpen(job)}>
        View details
      </Button>
    </article>
  );
}
