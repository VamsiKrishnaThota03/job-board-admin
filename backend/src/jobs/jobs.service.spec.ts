import { NotFoundException } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { FakeJobRepository } from '../../test/fake-repository';

describe('JobsService', () => {
  let service: JobsService;

  beforeEach(() => {
    service = new JobsService(new FakeJobRepository() as any);
  });

  it('creates and lists jobs newest first', async () => {
    await service.create({ title: 'A' } as any);
    await new Promise((r) => setTimeout(r, 2));
    await service.create({ title: 'B' } as any);
    const jobs = await service.findAll();
    expect(jobs.map((j) => j.title)).toEqual(['B', 'A']);
  });

  it('throws NotFound for missing jobs', async () => {
    await expect(service.findOne(42)).rejects.toBeInstanceOf(NotFoundException);
    await expect(service.update(42, { title: 'x' })).rejects.toBeInstanceOf(
      NotFoundException,
    );
    await expect(service.remove(42)).rejects.toBeInstanceOf(NotFoundException);
  });
});
