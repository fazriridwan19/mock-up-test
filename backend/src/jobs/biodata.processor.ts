import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { BIODATA_QUEUE, BIODATA_JOBS } from '../queues/biodata.queue';
import { BiodataRepository } from '../modules/biodata/repositories/biodata.repository';
import { EducationHistoryRepository } from '../modules/education/repositories/education-history.repository';
import { TrainingHistoryRepository } from '../modules/training/repositories/training-history.repository';
import { EmploymentHistoryRepository } from '../modules/employment/repositories/employment-history.repository';
import { BiodataEntity } from '../modules/biodata/entities/biodata.entity';
import { EducationHistoryEntity } from '../modules/education/entities/education-history.entity';
import { TrainingHistoryEntity } from '../modules/training/entities/training-history.entity';
import { EmploymentHistoryEntity } from '../modules/employment/entities/employment-history.entity';
import {
  CreateBiodataDto,
  UpdateBiodataDto,
} from '../modules/biodata/dto/biodata.dto';
import { Transactional } from 'src/config/transactional.config';

export interface CreateBiodataJobPayload {
  userId: string;
  dto: CreateBiodataDto;
}

export interface UpdateBiodataJobPayload {
  userId: string;
  dto: UpdateBiodataDto;
}

export interface DeleteBiodataJobPayload {
  userId: string;
}

export interface AdminUpdateBiodataJobPayload {
  biodataId: string;
  dto: UpdateBiodataDto;
}

export interface AdminDeleteBiodataJobPayload {
  biodataId: string;
}

@Processor(BIODATA_QUEUE, {
  concurrency: 5,
})
export class BiodataProcessor extends WorkerHost {
  private readonly logger = new Logger(BiodataProcessor.name);

  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly biodataRepository: BiodataRepository,
    private readonly educationRepository: EducationHistoryRepository,
    private readonly trainingRepository: TrainingHistoryRepository,
    private readonly employmentRepository: EmploymentHistoryRepository,
  ) {
    super();
  }

  async process(job: Job): Promise<unknown> {
    const start = Date.now();
    this.logger.log(`Processing job [${job.name}] id=${job.id}`);

    try {
      let result: unknown;

      switch (job.name) {
        case BIODATA_JOBS.CREATE:
          result = await this.handleCreate(job.data as CreateBiodataJobPayload);
          break;
        case BIODATA_JOBS.UPDATE:
          result = await this.handleUpdate(job.data as UpdateBiodataJobPayload);
          break;
        case BIODATA_JOBS.DELETE:
          result = await this.handleDelete(job.data as DeleteBiodataJobPayload);
          break;
        case BIODATA_JOBS.ADMIN_UPDATE:
          result = await this.handleAdminUpdate(
            job.data as AdminUpdateBiodataJobPayload,
          );
          break;
        case BIODATA_JOBS.ADMIN_DELETE:
          result = await this.handleAdminDelete(
            job.data as AdminDeleteBiodataJobPayload,
          );
          break;
        default:
          throw new Error(`Unknown job type: ${job.name}`);
      }

      this.logger.log(
        `Job [${job.name}] id=${job.id} completed in ${Date.now() - start}ms`,
      );

      return result;
    } catch (error) {
      this.logger.error(
        `Job [${job.name}] id=${job.id} failed: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  @Transactional()
  private async handleCreate(
    payload: CreateBiodataJobPayload,
  ): Promise<{ biodataId: string }> {
    const { userId, dto } = payload;

    const existing = await this.biodataRepository.findByUserId(userId);

    if (existing) {
      throw new Error('Biodata sudah ada');
    }

    const {
      educationHistories,
      trainingHistories,
      employmentHistories,
      ...bioDto
    } = dto;

    const biodata = await this.biodataRepository.create({
      ...bioDto,
      userId,
      birthDate: new Date(dto.birthDate),
      willingToBePlaced: dto.willingToBePlaced ?? false,
      expectedSalary: dto.expectedSalary ?? 0,
    });

    const { educations, trainings, employments } =
      await this.buildChildEntities(
        biodata.id,
        educationHistories,
        trainingHistories,
        employmentHistories,
      );

    await Promise.all([
      this.educationRepository.insertBulk(educations),
      this.trainingRepository.insertBulk(trainings),
      this.employmentRepository.insertBulk(employments),
    ]);

    this.logger.log(`CREATE: biodata ${biodata.id} for user ${userId}`);
    return { biodataId: biodata.id };
  }

  private async handleUpdate(
    payload: UpdateBiodataJobPayload,
  ): Promise<{ biodataId: string }> {
    const { userId, dto } = payload;
    const biodata = await this.biodataRepository.findByUserId(userId);

    if (!biodata) {
      throw new Error('Biodata tidak ditemukan');
    }

    const {
      educationHistories,
      trainingHistories,
      employmentHistories,
      ...biodataData
    } = dto;

    Object.assign(biodata, {
      ...biodataData,
      birthDate: new Date(dto.birthDate),
    });
    await this.biodataRepository.save(biodata);

    await Promise.all([
      this.educationRepository.deleteByBiodataId(biodata.id),
      this.trainingRepository.deleteByBiodataId(biodata.id),
      this.employmentRepository.deleteByBiodataId(biodata.id),
    ]);

    const { educations, trainings, employments } =
      await this.buildChildEntities(
        biodata.id,
        educationHistories,
        trainingHistories,
        employmentHistories,
      );

    await Promise.all([
      this.educationRepository.insertBulk(educations),
      this.trainingRepository.insertBulk(trainings),
      this.employmentRepository.insertBulk(employments),
    ]);

    return { biodataId: biodata.id };
  }

  @Transactional()
  private async handleDelete(
    payload: DeleteBiodataJobPayload,
  ): Promise<{ biodataId: string }> {
    const { userId } = payload;

    const biodata = await this.biodataRepository.findByUserId(userId);
    if (!biodata) {
      throw new Error('Biodata tidak ditemukan');
    }

    await this.biodataRepository.deleteById(biodata.id);
    this.logger.log(`DELETE: biodata ${biodata.id} for user ${userId}`);
    return { biodataId: biodata.id };
  }

  private async handleAdminUpdate(
    payload: AdminUpdateBiodataJobPayload,
  ): Promise<{ biodataId: string }> {
    const { biodataId, dto } = payload;

    const biodata = await this.biodataRepository.findById(biodataId);
    if (!biodata) {
      throw new Error(`Biodata ${biodataId} tidak ditemukan`);
    }

    const {
      educationHistories,
      trainingHistories,
      employmentHistories,
      ...biodataData
    } = dto;

    return this.dataSource.transaction(async (manager) => {
      const biodataRepo = manager.getRepository(BiodataEntity);
      const eduRepo = manager.getRepository(EducationHistoryEntity);
      const trainRepo = manager.getRepository(TrainingHistoryEntity);
      const empRepo = manager.getRepository(EmploymentHistoryEntity);

      Object.assign(biodata, {
        ...biodataData,
        birthDate: new Date(dto.birthDate),
      });
      await biodataRepo.save(biodata);

      await eduRepo.softDelete({ biodataId });
      await trainRepo.softDelete({ biodataId });
      await empRepo.softDelete({ biodataId });

      await this.saveChildEntities(
        manager,
        biodataId,
        educationHistories,
        trainingHistories,
        employmentHistories,
      );

      this.logger.log(`ADMIN_UPDATE: biodata ${biodataId}`);
      return { biodataId };
    });
  }

  private async handleAdminDelete(
    payload: AdminDeleteBiodataJobPayload,
  ): Promise<{ biodataId: string }> {
    const { biodataId } = payload;

    const biodata = await this.biodataRepository.findById(biodataId);
    if (!biodata) {
      throw new Error(`Biodata ${biodataId} tidak ditemukan`);
    }

    await this.biodataRepository.deleteById(biodataId);
    this.logger.log(`ADMIN_DELETE: biodata ${biodataId}`);
    return { biodataId };
  }

  private async saveChildEntities(
    manager: import('typeorm').EntityManager,
    biodataId: string,
    educationHistories: CreateBiodataDto['educationHistories'],
    trainingHistories: CreateBiodataDto['trainingHistories'],
    employmentHistories: CreateBiodataDto['employmentHistories'],
  ) {
    const eduRepo = manager.getRepository(EducationHistoryEntity);
    const trainRepo = manager.getRepository(TrainingHistoryEntity);
    const empRepo = manager.getRepository(EmploymentHistoryEntity);

    if (educationHistories?.length) {
      const entities = educationHistories.map((e) =>
        eduRepo.create({ ...e, biodataId }),
      );
      await eduRepo.save(entities);
    }

    if (trainingHistories?.length) {
      const entities = trainingHistories.map((t) =>
        trainRepo.create({ ...t, biodataId }),
      );
      await trainRepo.save(entities);
    }

    if (employmentHistories?.length) {
      const entities = employmentHistories.map((e) =>
        empRepo.create({
          ...e,
          biodataId,
          startDate: new Date(e.startDate),
          endDate: e.endDate ? new Date(e.endDate) : undefined,
        }),
      );
      await empRepo.save(entities);
    }
  }

  private async buildChildEntities(
    biodataId: string,
    educationHistories: CreateBiodataDto['educationHistories'],
    trainingHistories: CreateBiodataDto['trainingHistories'],
    employmentHistories: CreateBiodataDto['employmentHistories'],
  ) {
    const educations: Partial<EducationHistoryEntity>[] = [];
    const trainings: Partial<TrainingHistoryEntity>[] = [];
    const employments: Partial<EmploymentHistoryEntity>[] = [];

    educationHistories?.forEach((education) =>
      educations.push({ ...education, biodataId }),
    );

    trainingHistories?.forEach((training) =>
      trainings.push({ ...training, biodataId }),
    );

    employmentHistories?.forEach((employement) =>
      employments.push({
        ...employement,
        biodataId,
        startDate: new Date(employement.startDate),
        endDate: employement.endDate
          ? new Date(employement.endDate)
          : undefined,
      }),
    );

    return {
      educations,
      trainings,
      employments,
    };
  }
}
