import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/common/repositories/base.repository';
import { DataSource } from 'typeorm';
import { EducationHistoryEntity } from '../entities/education-history.entity';

@Injectable()
export class EducationHistoryRepository extends BaseRepository<EducationHistoryEntity> {
  constructor(readonly dataSource: DataSource) {
    super(EducationHistoryEntity, dataSource);
  }

  async findByBiodataId(biodataId: string): Promise<EducationHistoryEntity[]> {
    return this.repository.find({ where: { biodataId } });
  }

  async findById(id: string): Promise<EducationHistoryEntity | null> {
    return this.repository.findOne({ where: { id } });
  }

  async create(
    data: Partial<EducationHistoryEntity>,
  ): Promise<EducationHistoryEntity> {
    const entity = this.repository.create(data);
    return this.repository.save(entity);
  }

  async insertBulk(data: Partial<EducationHistoryEntity>[]) {
    return this.repository.insert(data);
  }

  async softDelete(id: string): Promise<void> {
    await this.repository.softDelete(id);
  }

  async deleteByBiodataId(biodataId: string): Promise<void> {
    await this.repository.delete({ biodataId });
  }
}
