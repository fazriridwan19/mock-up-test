import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/common/repositories/base.repository';
import { DataSource } from 'typeorm';
import { BiodataEntity } from '../entities/biodata.entity';

export interface FindAllOptions {
  page: number;
  limit: number;
  search?: string;
  appliedPosition?: string;
  latestEducation?: string;
}

@Injectable()
export class BiodataRepository extends BaseRepository<BiodataEntity> {
  constructor(readonly dataSource: DataSource) {
    super(BiodataEntity, dataSource);
  }

  async findByUserId(userId: string): Promise<BiodataEntity | null> {
    return this.repository.findOne({
      where: { userId },
      relations: {
        educationHistories: true,
        trainingHistories: true,
        employmentHistories: true,
      },
    });
  }

  async findById(id: string): Promise<BiodataEntity | null> {
    return this.repository.findOne({
      where: { id },
      relations: {
        educationHistories: true,
        trainingHistories: true,
        employmentHistories: true,
        user: true,
      },
    });
  }

  async create(data: Partial<BiodataEntity>): Promise<BiodataEntity> {
    const biodata = this.repository.create(data);
    return this.repository.save(biodata);
  }

  async deleteById(id: string): Promise<void> {
    await this.repository.delete({ id });
  }

  async findAll(
    options: FindAllOptions,
  ): Promise<{ data: BiodataEntity[]; total: number }> {
    const { page, limit, search, appliedPosition, latestEducation } = options;
    const offset = (page - 1) * limit;

    const qb = this.repository
      .createQueryBuilder('biodata')
      .leftJoinAndSelect('biodata.educationHistories', 'education')
      .leftJoinAndSelect('biodata.trainingHistories', 'training')
      .leftJoinAndSelect('biodata.employmentHistories', 'employment')
      .where('biodata.deleted_at IS NULL');

    if (search) {
      qb.andWhere('biodata.full_name LIKE :search', { search: `%${search}%` });
    }

    if (appliedPosition) {
      qb.andWhere('biodata.applied_position LIKE :appliedPosition', {
        appliedPosition: `%${appliedPosition}%`,
      });
    }

    if (latestEducation) {
      qb.andWhere('education.degree = :latestEducation', { latestEducation });
    }

    qb.orderBy('biodata.created_at', 'DESC').skip(offset).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return { data, total };
  }
}
