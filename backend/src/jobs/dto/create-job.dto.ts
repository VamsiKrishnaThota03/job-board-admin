import {
  IsString,
  IsIn,
  IsNotEmpty,
  IsDateString,
  IsOptional,
  MaxLength,
} from 'class-validator';
import {
  JOB_TYPES,
  JobType,
  WORK_MODES,
  WorkMode,
} from '../entities/job.entity';

export class CreateJobDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  title: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  companyName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  location: string;

  @IsIn(JOB_TYPES)
  jobType: JobType;

  @IsIn(WORK_MODES)
  workMode: WorkMode;

  @IsString()
  @IsOptional()
  @MaxLength(60)
  experience?: string;

  @IsString()
  @IsOptional()
  @MaxLength(60)
  salary?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  salaryRange: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  description: string;

  @IsDateString()
  applicationDeadline: Date;
}
