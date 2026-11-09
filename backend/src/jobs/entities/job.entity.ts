import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export const JOB_TYPES = [
  'Full-time',
  'Part-time',
  'Contract',
  'Internship',
] as const;
export const WORK_MODES = ['Onsite', 'Remote', 'Hybrid'] as const;
export type JobType = (typeof JOB_TYPES)[number];
export type WorkMode = (typeof WORK_MODES)[number];

@Entity()
export class Job {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  companyName: string;

  @Column()
  location: string;

  @Column({
    type: 'enum',
    enum: JOB_TYPES,
    default: 'Full-time',
  })
  jobType: JobType;

  @Column({
    type: 'enum',
    enum: WORK_MODES,
    default: 'Onsite',
  })
  workMode: WorkMode;

  @Column({ nullable: true })
  experience: string;

  @Column({ nullable: true })
  salary: string;

  @Column()
  salaryRange: string;

  @Column('text')
  description: string;

  @Column({ type: 'timestamp' })
  applicationDeadline: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
