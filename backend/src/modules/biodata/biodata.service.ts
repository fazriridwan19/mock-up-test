import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue, Job } from 'bullmq';
import { BIODATA_QUEUE, BIODATA_JOBS } from '../../queues/biodata.queue';
import {
  CreateBiodataJobPayload,
  UpdateBiodataJobPayload,
  DeleteBiodataJobPayload,
  AdminUpdateBiodataJobPayload,
  AdminDeleteBiodataJobPayload,
} from '../../jobs/biodata.processor';
import { BiodataRepository } from './repositories/biodata.repository';
import { CreateBiodataDto, UpdateBiodataDto } from './dto/biodata.dto';
import { BiodataEntity } from './entities/biodata.entity';

const JOB_OPTIONS = {
  attempts: 3,
  backoff: { type: 'exponential' as const, delay: 1000 },
  removeOnComplete: { count: 200 },
  removeOnFail: { count: 100 },
};

@Injectable()
export class BiodataService {
  private readonly logger = new Logger(BiodataService.name);

  constructor(
    private readonly biodataRepository: BiodataRepository,
    @InjectQueue(BIODATA_QUEUE) private readonly biodataQueue: Queue,
  ) {}

  async getMyBiodata(userId: string): Promise<BiodataEntity> {
    const biodata = await this.biodataRepository.findByUserId(userId);
    if (!biodata) throw new NotFoundException('Biodata belum dibuat');
    return biodata;
  }

  async getAdminBiodataList(options: {
    page: number;
    limit: number;
    search?: string;
    appliedPosition?: string;
    latestEducation?: string;
  }) {
    const { data, total } = await this.biodataRepository.findAll(options);
    return {
      data,
      meta: {
        total,
        page: options.page,
        limit: options.limit,
        totalPages: Math.ceil(total / options.limit),
      },
    };
  }

  async getAdminBiodataById(id: string): Promise<BiodataEntity> {
    const biodata = await this.biodataRepository.findById(id);
    if (!biodata) throw new NotFoundException('Biodata tidak ditemukan');
    return biodata;
  }

  async enqueueCreate(userId: string, dto: CreateBiodataDto): Promise<string> {
    const payload: CreateBiodataJobPayload = { userId, dto };
    const job = await this.biodataQueue.add(
      BIODATA_JOBS.CREATE,
      payload,
      JOB_OPTIONS,
    );
    this.logger.log(`Enqueued CREATE job ${job.id} for user ${userId}`);
    return job.id as string;
  }

  async enqueueUpdate(userId: string, dto: UpdateBiodataDto): Promise<string> {
    const payload: UpdateBiodataJobPayload = { userId, dto };
    const job = await this.biodataQueue.add(
      BIODATA_JOBS.UPDATE,
      payload,
      JOB_OPTIONS,
    );
    this.logger.log(`Enqueued UPDATE job ${job.id} for user ${userId}`);
    return job.id as string;
  }

  async enqueueDelete(userId: string): Promise<string> {
    const payload: DeleteBiodataJobPayload = { userId };
    const job = await this.biodataQueue.add(
      BIODATA_JOBS.DELETE,
      payload,
      JOB_OPTIONS,
    );
    this.logger.log(`Enqueued DELETE job ${job.id} for user ${userId}`);
    return job.id as string;
  }

  async enqueueAdminUpdate(
    biodataId: string,
    dto: UpdateBiodataDto,
  ): Promise<string> {
    const payload: AdminUpdateBiodataJobPayload = { biodataId, dto };
    const job = await this.biodataQueue.add(
      BIODATA_JOBS.ADMIN_UPDATE,
      payload,
      JOB_OPTIONS,
    );
    this.logger.log(
      `Enqueued ADMIN_UPDATE job ${job.id} for biodata ${biodataId}`,
    );
    return job.id as string;
  }

  async enqueueAdminDelete(biodataId: string): Promise<string> {
    const payload: AdminDeleteBiodataJobPayload = { biodataId };
    const job = await this.biodataQueue.add(
      BIODATA_JOBS.ADMIN_DELETE,
      payload,
      JOB_OPTIONS,
    );
    this.logger.log(
      `Enqueued ADMIN_DELETE job ${job.id} for biodata ${biodataId}`,
    );
    return job.id as string;
  }

  async getJobStatus(jobId: string): Promise<{
    id: string;
    state: string;
    progress: number;
    result: unknown;
    error: string | null;
  }> {
    const job: Job | undefined = await this.biodataQueue.getJob(jobId);

    if (!job) {
      throw new NotFoundException(`Job ${jobId} tidak ditemukan`);
    }

    const state = await job.getState();
    const failedReason = job.failedReason ?? null;

    return {
      id: jobId,
      state, // 'waiting' | 'active' | 'completed' | 'failed' | 'delayed'
      progress: typeof job.progress === 'number' ? job.progress : 0,
      result: state === 'completed' ? job.returnvalue : null,
      error: state === 'failed' ? failedReason : null,
    };
  }
}
