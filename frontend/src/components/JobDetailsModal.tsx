'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Badge, Button, Group, Modal, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconCalendar, IconPencil, IconTrash } from '@tabler/icons-react';
import { Job } from '@/types/job';
import { formatDate } from '@/lib/format';
import { jobsApi } from '@/services/api';
import { CompanyLogo } from './CompanyLogo';

interface JobDetailsModalProps {
  job: Job | null;
  onClose: () => void;
  onDeleted: (id: number) => void;
}

export function JobDetailsModal({ job, onClose, onDeleted }: JobDetailsModalProps) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const close = () => {
    setConfirming(false);
    onClose();
  };

  const handleDelete = async () => {
    if (!job) return;
    setDeleting(true);
    try {
      await jobsApi.deleteJob(job.id);
      notifications.show({ title: 'Job deleted', message: job.title, color: 'gray' });
      onDeleted(job.id);
      close();
    } catch (error) {
      notifications.show({ title: 'Could not delete job', message: error instanceof Error ? error.message : 'Unexpected error', color: 'red' });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Modal opened={!!job} onClose={close} size="lg" centered radius="lg" padding="xl" withCloseButton title={<span className="text-sm font-medium text-gray-500">Job details</span>}>
      {job && (
        <div>
          <div className="flex items-start gap-4">
            <CompanyLogo name={job.companyName} size={72} />
            <div className="min-w-0">
              <h2 className="text-xl font-bold text-gray-900">{job.title}</h2>
              <p className="text-gray-600">
                {job.companyName} · {job.location}
              </p>
              <Group gap="xs" mt="xs">
                <Badge variant="light">{job.jobType}</Badge>
                <Badge variant="light" color="grape">
                  {job.workMode}
                </Badge>
                {job.experience && (
                  <Badge variant="light" color="gray">
                    {job.experience}
                  </Badge>
                )}
              </Group>
            </div>
          </div>

          <dl className="mt-6 grid grid-cols-1 gap-4 rounded-xl bg-gray-50 p-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-gray-500">Salary</dt>
              <dd className="font-semibold text-gray-900">
                {job.salaryRange}
                {job.salary ? ` (${job.salary})` : ''}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">Apply by</dt>
              <dd className="flex items-center gap-1 font-semibold text-gray-900">
                <IconCalendar size={16} aria-hidden="true" /> {formatDate(job.applicationDeadline)}
              </dd>
            </div>
          </dl>

          <Text mt="lg" fw={600}>
            About the role
          </Text>
          <Text mt={4} c="dimmed" className="whitespace-pre-line leading-relaxed">
            {job.description}
          </Text>

          {job.isSample ? (
            <Text mt="xl" size="sm" c="dimmed">
              This is a sample listing shown because the jobs API is unavailable.
            </Text>
          ) : (
            <Group justify="space-between" mt="xl">
              {confirming ? (
                <Group gap="xs">
                  <Text size="sm">Delete this job?</Text>
                  <Button size="xs" color="red" loading={deleting} onClick={handleDelete}>
                    Delete
                  </Button>
                  <Button size="xs" variant="default" onClick={() => setConfirming(false)}>
                    Keep
                  </Button>
                </Group>
              ) : (
                <Button variant="subtle" color="red" leftSection={<IconTrash size={16} />} onClick={() => setConfirming(true)}>
                  Delete
                </Button>
              )}
              <Button component={Link} href={`/jobs/${job.id}/edit`} variant="light" leftSection={<IconPencil size={16} />}>
                Edit job
              </Button>
            </Group>
          )}
        </div>
      )}
    </Modal>
  );
}
