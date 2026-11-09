'use client';

import { RangeSlider, Select, TextInput } from '@mantine/core';
import { IconBriefcase, IconMapPin, IconSearch } from '@tabler/icons-react';
import { JOB_TYPES, LOCATIONS } from '@/types/job';

export interface Filters {
  search: string;
  location: string;
  jobType: string;
  salaryRange: [number, number];
}

export const SALARY_MAX_K = 200;
export const defaultFilters: Filters = { search: '', location: '', jobType: '', salaryRange: [0, SALARY_MAX_K] };

interface SearchFiltersProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

const fieldStyles = {
  input: { border: 'none', backgroundColor: 'transparent', height: 48, fontSize: 15, fontWeight: 500, color: '#374151' },
};

export function SearchFilters({ filters, onChange }: SearchFiltersProps) {
  const set = <K extends keyof Filters>(key: K, value: Filters[K]) => onChange({ ...filters, [key]: value });
  const [min, max] = filters.salaryRange;

  return (
    <section aria-label="Filter jobs" className="mx-auto mt-6 w-full max-w-7xl px-4 sm:mt-8">
      <div className="grid grid-cols-1 gap-2 rounded-2xl bg-white px-4 py-3 shadow-[0_0_14px_rgba(198,191,191,0.25)] sm:grid-cols-2 lg:grid-cols-4 lg:gap-0 lg:divide-x lg:divide-gray-200 lg:px-2">
        <div className="lg:px-4">
          <TextInput
            aria-label="Search by job title or company"
            placeholder="Search by job title, company"
            leftSection={<IconSearch size={20} color="#686868" />}
            value={filters.search}
            onChange={(e) => set('search', e.currentTarget.value)}
            styles={fieldStyles}
          />
        </div>
        <div className="lg:px-4">
          <Select
            aria-label="Preferred location"
            placeholder="Preferred location"
            leftSection={<IconMapPin size={20} color="#686868" />}
            data={LOCATIONS}
            value={filters.location || null}
            onChange={(v) => set('location', v || '')}
            clearable
            styles={fieldStyles}
          />
        </div>
        <div className="lg:px-4">
          <Select
            aria-label="Job type"
            placeholder="Job type"
            leftSection={<IconBriefcase size={20} color="#686868" />}
            data={[...JOB_TYPES]}
            value={filters.jobType || null}
            onChange={(v) => set('jobType', v || '')}
            clearable
            styles={fieldStyles}
          />
        </div>
        <div className="px-3 pb-2 pt-1 lg:px-5 lg:py-0">
          <div className="mb-3 flex items-center justify-between text-sm font-semibold text-gray-800">
            <span id="salary-label">Salary per month</span>
            <span aria-live="polite">
              ₹{min}k – ₹{max}k{max === SALARY_MAX_K ? '+' : ''}
            </span>
          </div>
          <RangeSlider
            aria-labelledby="salary-label"
            min={0}
            max={SALARY_MAX_K}
            step={10}
            minRange={10}
            value={filters.salaryRange}
            onChange={(v) => set('salaryRange', v)}
            label={(v) => `₹${v}k`}
            color="dark"
            size="xs"
            thumbSize={14}
          />
        </div>
      </div>
    </section>
  );
}
