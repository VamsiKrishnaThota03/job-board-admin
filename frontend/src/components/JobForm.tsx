'use client';

import { useEffect, useState } from 'react';
import { Button, Group, NumberInput, Select, SimpleGrid, Stack, Text, TextInput, Textarea } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { IconCalendar } from '@tabler/icons-react';
import { JOB_TYPES, Job, JobFormData, JobType, LOCATIONS, WORK_MODES, WorkMode } from '@/types/job';

interface FormState {
  title: string;
  companyName: string;
  location: string;
  jobType: string;
  workMode: string;
  experience: string;
  salaryMin: number | '';
  salaryMax: number | '';
  description: string;
  applicationDeadline: Date | null;
}

const empty: FormState = {
  title: '',
  companyName: '',
  location: '',
  jobType: '',
  workMode: '',
  experience: '',
  salaryMin: '',
  salaryMax: '',
  description: '',
  applicationDeadline: null,
};

/** Split "₹6,00,000 - ₹12,00,000" back into numbers for editing. */
function parseRange(range?: string): [number | '', number | ''] {
  const n = (range?.match(/\d[\d,]*/g) || []).map((s) => Number(s.replace(/,/g, '')));
  return [n[0] ?? '', n[1] ?? n[0] ?? ''];
}

export function fromJob(job: Job): FormState {
  const [salaryMin, salaryMax] = parseRange(job.salaryRange);
  return {
    title: job.title,
    companyName: job.companyName,
    location: job.location,
    jobType: job.jobType,
    workMode: job.workMode,
    experience: job.experience || '',
    salaryMin,
    salaryMax,
    description: job.description,
    applicationDeadline: job.applicationDeadline ? new Date(job.applicationDeadline) : null,
  };
}

function toPayload(s: FormState): JobFormData {
  const min = Number(s.salaryMin) || 0;
  const max = Number(s.salaryMax) || min;
  const fmt = (v: number) => `₹${v.toLocaleString('en-IN')}`;
  // Annual figures (>= 1 lakh) are summarised as LPA for the card
  const lpa = max >= 100000 ? `${Math.round((max / 100000) * 10) / 10} LPA` : undefined;
  const d = s.applicationDeadline!;
  return {
    title: s.title.trim(),
    companyName: s.companyName.trim(),
    location: s.location,
    jobType: s.jobType as JobType,
    workMode: s.workMode as WorkMode,
    experience: s.experience.trim() || undefined,
    salary: lpa,
    salaryRange: `${fmt(min)} - ${fmt(max)}`,
    description: s.description.trim(),
    // Date-only string avoids timezone shifts
    applicationDeadline: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
  };
}

function validate(s: FormState): Partial<Record<keyof FormState, string>> {
  const errors: Partial<Record<keyof FormState, string>> = {};
  if (!s.title.trim()) errors.title = 'Job title is required';
  if (!s.companyName.trim()) errors.companyName = 'Company name is required';
  if (!s.location) errors.location = 'Choose a location';
  if (!s.jobType) errors.jobType = 'Choose a job type';
  if (!s.workMode) errors.workMode = 'Choose a work mode';
  if (s.salaryMin === '' || s.salaryMax === '') errors.salaryMin = 'Enter a minimum and maximum salary';
  else if (Number(s.salaryMax) < Number(s.salaryMin)) errors.salaryMin = 'Maximum must be greater than minimum';
  if (!s.applicationDeadline) errors.applicationDeadline = 'Pick a deadline';
  if (!s.description.trim()) errors.description = 'Add a short description';
  return errors;
}

interface JobFormProps {
  initial?: FormState;
  submitLabel: string;
  onSubmit: (data: JobFormData) => Promise<void>;
  /** When set, form state is saved to localStorage under this key ("Save draft"). */
  draftKey?: string;
  onCancel?: () => void;
}

export function JobForm({ initial, submitLabel, onSubmit, draftKey, onCancel }: JobFormProps) {
  const [state, setState] = useState<FormState>(initial ?? empty);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);

  // Restore a saved draft
  useEffect(() => {
    if (!draftKey || initial) return;
    try {
      const saved = JSON.parse(localStorage.getItem(draftKey) || 'null');
      if (saved) setState({ ...empty, ...saved, applicationDeadline: saved.applicationDeadline ? new Date(saved.applicationDeadline) : null });
    } catch {
      // ignore corrupt drafts
    }
  }, [draftKey, initial]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setState((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
    setDraftSaved(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const found = validate(state);
    setErrors(found);
    if (Object.values(found).some(Boolean)) return;
    setSubmitting(true);
    try {
      await onSubmit(toPayload(state));
      if (draftKey) localStorage.removeItem(draftKey);
    } finally {
      setSubmitting(false);
    }
  };

  const saveDraft = () => {
    if (!draftKey) return;
    localStorage.setItem(draftKey, JSON.stringify(state));
    setDraftSaved(true);
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Stack gap="lg">
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
          <TextInput label="Job title" placeholder="Full Stack Developer" value={state.title} onChange={(e) => set('title', e.currentTarget.value)} error={errors.title} withAsterisk maxLength={120} size="md" />
          <TextInput label="Company name" placeholder="Amazon, Microsoft, Swiggy" value={state.companyName} onChange={(e) => set('companyName', e.currentTarget.value)} error={errors.companyName} withAsterisk maxLength={120} size="md" />
          <Select label="Location" placeholder="Choose preferred location" data={LOCATIONS} value={state.location || null} onChange={(v) => set('location', v || '')} error={errors.location} withAsterisk searchable size="md" />
          <Select label="Job type" placeholder="Full-time" data={[...JOB_TYPES]} value={state.jobType || null} onChange={(v) => set('jobType', v || '')} error={errors.jobType} withAsterisk size="md" />
          <Select label="Work mode" placeholder="Onsite, Remote or Hybrid" data={[...WORK_MODES]} value={state.workMode || null} onChange={(v) => set('workMode', v || '')} error={errors.workMode} withAsterisk size="md" />
          <TextInput label="Experience" placeholder="e.g. 1-3 yrs" value={state.experience} onChange={(e) => set('experience', e.currentTarget.value)} maxLength={60} size="md" />
          <div>
            <Text component="label" size="md" fw={500} className="mb-1 block">
              Salary range (₹ per year) <span className="text-red-500">*</span>
            </Text>
            <Group grow gap="sm" align="flex-start">
              <NumberInput aria-label="Minimum salary" placeholder="₹0" prefix="₹" thousandSeparator="," min={0} value={state.salaryMin} onChange={(v) => set('salaryMin', v === '' ? '' : Number(v))} error={Boolean(errors.salaryMin)} size="md" hideControls />
              <NumberInput aria-label="Maximum salary" placeholder="₹12,00,000" prefix="₹" thousandSeparator="," min={0} value={state.salaryMax} onChange={(v) => set('salaryMax', v === '' ? '' : Number(v))} error={Boolean(errors.salaryMin)} size="md" hideControls />
            </Group>
            {errors.salaryMin && (
              <Text size="xs" c="red" mt={4}>
                {errors.salaryMin}
              </Text>
            )}
          </div>
          <DateInput label="Application deadline" placeholder="Pick a date" value={state.applicationDeadline} onChange={(d) => set('applicationDeadline', d)} error={errors.applicationDeadline} minDate={new Date()} withAsterisk size="md" rightSection={<IconCalendar size={18} />} valueFormat="DD MMM YYYY" />
        </SimpleGrid>

        <Textarea label="Job description" placeholder="Share what the role involves so candidates know more about it" minRows={5} autosize value={state.description} onChange={(e) => set('description', e.currentTarget.value)} error={errors.description} withAsterisk maxLength={5000} size="md" />

        <Group justify="space-between" mt="sm">
          {draftKey ? (
            <Button variant="default" size="md" onClick={saveDraft}>
              {draftSaved ? 'Draft saved' : 'Save draft'}
            </Button>
          ) : onCancel ? (
            <Button variant="default" size="md" onClick={onCancel}>
              Cancel
            </Button>
          ) : (
            <span />
          )}
          <Button type="submit" size="md" color="cyan" loading={submitting}>
            {submitLabel}
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
