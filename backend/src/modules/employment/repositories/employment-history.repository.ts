import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/common/repositories/base.repository';
import { DataSource } from 'typeorm';
import { EmploymentHistoryEntity } from '../entities/employment-history.entity';

@Injectable()
export class EmploymentHistoryRepository extends BaseRepository<EmploymentHistoryEntity> {
  constructor(readonly dataSource: DataSource) {
    super(EmploymentHistoryEntity, dataSource);
  }

  async findByBiodataId(biodataId: string): Promise<EmploymentHistoryEntity[]> {
    return this.repository.find({ where: { biodataId } });
  }

  async findById(id: string): Promise<EmploymentHistoryEntity | null> {
    return this.repository.findOne({ where: { id } });
  }

  async create(
    data: Partial<EmploymentHistoryEntity>,
  ): Promise<EmploymentHistoryEntity> {
    const entity = this.repository.create(data);
    return this.repository.save(entity);
  }

  async insertBulk(data: Partial<EmploymentHistoryEntity>[]) {
    return this.repository.insert(data);
  }

  async softDelete(id: string): Promise<void> {
    await this.repository.softDelete(id);
  }

  async deleteByBiodataId(biodataId: string): Promise<void> {
    await this.repository.delete({ biodataId });
  }
}
