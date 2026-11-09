import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as request from 'supertest';
import { AppController } from '../src/app.controller';
import { AppService } from '../src/app.service';
import { JobsController } from '../src/jobs/jobs.controller';
import { JobsService } from '../src/jobs/jobs.service';
import { Job } from '../src/jobs/entities/job.entity';
import { configureApp } from '../src/main';
import { FakeJobRepository } from './fake-repository';

const validJob = {
  title: 'Full Stack Developer',
  companyName: 'Amazon',
  location: 'Bangalore',
  jobType: 'Full-time',
  workMode: 'Hybrid',
  experience: '1-3 yrs',
  salary: '12 LPA',
  salaryRange: '₹6,00,000 - ₹12,00,000',
  description: 'Build and ship features. Work with product and design.',
  applicationDeadline: '2030-01-31',
};

describe('Jobs API (e2e, in-memory repository)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    delete process.env.ADMIN_API_KEY;
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AppController, JobsController],
      providers: [
        AppService,
        JobsService,
        { provide: getRepositoryToken(Job), useValue: new FakeJobRepository() },
      ],
    }).compile();

    app = configureApp(moduleFixture.createNestApplication());
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('GET / returns health', () =>
    request(app.getHttpServer()).get('/').expect(200).expect({ status: 'ok' }));

  it('creates, reads, updates and deletes a job', async () => {
    const server = app.getHttpServer();
    const created = await request(server)
      .post('/jobs')
      .send(validJob)
      .expect(201);
    expect(created.body.id).toBe(1);

    const list = await request(server).get('/jobs').expect(200);
    expect(list.body).toHaveLength(1);

    const updated = await request(server)
      .patch('/jobs/1')
      .send({ title: 'Senior Developer' })
      .expect(200);
    expect(updated.body.title).toBe('Senior Developer');
    expect(updated.body.companyName).toBe('Amazon');

    await request(server).delete('/jobs/1').expect(204);
    await request(server).get('/jobs/1').expect(404);
  });

  it('rejects invalid payloads and unknown fields', async () => {
    const server = app.getHttpServer();
    await request(server)
      .post('/jobs')
      .send({ ...validJob, jobType: 'Freelance' })
      .expect(400);
    await request(server)
      .post('/jobs')
      .send({ ...validJob, title: '' })
      .expect(400);
    await request(server)
      .post('/jobs')
      .send({ ...validJob, isAdmin: true })
      .expect(400);
    await request(server).get('/jobs/abc').expect(400);
  });

  it('requires x-admin-key for writes when ADMIN_API_KEY is set', async () => {
    process.env.ADMIN_API_KEY = 'test-key';
    const server = app.getHttpServer();
    await request(server).post('/jobs').send(validJob).expect(401);
    await request(server)
      .post('/jobs')
      .set('x-admin-key', 'wrong')
      .send(validJob)
      .expect(401);
    await request(server)
      .post('/jobs')
      .set('x-admin-key', 'test-key')
      .send(validJob)
      .expect(201);
    await request(server).get('/jobs').expect(200);
    delete process.env.ADMIN_API_KEY;
  });
});
