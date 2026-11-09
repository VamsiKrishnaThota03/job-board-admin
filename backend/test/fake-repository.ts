import { Job } from '../src/jobs/entities/job.entity';

/** Minimal in-memory stand-in for the TypeORM Repository<Job> used by JobsService. */
export class FakeJobRepository {
  private rows: Job[] = [];
  private nextId = 1;

  create(dto: Partial<Job>): Job {
    return { ...dto } as Job;
  }

  async save(job: Job): Promise<Job> {
    const now = new Date();
    if (!job.id) {
      Object.assign(job, { id: this.nextId++, createdAt: now, updatedAt: now });
      this.rows.push(job);
    } else {
      job.updatedAt = now;
      this.rows = this.rows.map((r) => (r.id === job.id ? job : r));
    }
    return { ...job };
  }

  async find(): Promise<Job[]> {
    return [...this.rows].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime() || b.id - a.id,
    );
  }

  async findOne({
    where: { id },
  }: {
    where: { id: number };
  }): Promise<Job | null> {
    const row = this.rows.find((r) => r.id === id);
    return row ? { ...row } : null;
  }

  async remove(job: Job): Promise<Job> {
    this.rows = this.rows.filter((r) => r.id !== job.id);
    return job;
  }
}
