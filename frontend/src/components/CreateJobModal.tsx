'use client';

import { Modal } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { jobsApi } from '@/services/api';
import { JobFormData } from '@/types/job';
import { JobForm } from './JobForm';

interface CreateJobModalProps {
  opened: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export function CreateJobModal({ opened, onClose, onCreated }: CreateJobModalProps) {
  const handleSubmit = async (data: JobFormData) => {
    try {
      await jobsApi.createJob(data);
      notifications.show({ title: 'Job published', message: `${data.title} at ${data.companyName} is live.`, color: 'green' });
      onCreated();
      onClose();
    } catch (error) {
      notifications.show({
        title: 'Could not publish job',
        message: error instanceof Error ? error.message : 'Unexpected error',
        color: 'red',
      });
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="xl"
      centered
      radius="lg"
      padding="xl"
      title={<span className="text-xl font-semibold">Create job opening</span>}
      overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
    >
      <JobForm submitLabel="Publish" onSubmit={handleSubmit} draftKey="job-draft" />
    </Modal>
  );
}
