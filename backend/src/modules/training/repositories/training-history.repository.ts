import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/common/repositories/base.repository';
import { DataSource } from 'typeorm';
import { TrainingHistoryEntity } from '../entities/training-history.entity';

@Injectable()
export class TrainingHistoryRepository extends BaseRepository<TrainingHistoryEntity> {
  constructor(readonly dataSource: DataSource) {
    super(TrainingHistoryEntity, dataSource);
  }

  async findByBiodataId(biodataId: string): Promise<TrainingHistoryEntity[]> {
    return this.repository.find({ where: { biodataId } });
  }

  async findById(id: string): Promise<TrainingHistoryEntity | null> {
    return this.repository.findOne({ where: { id } });
  }

  async create(
    data: Partial<TrainingHistoryEntity>,
  ): Promise<TrainingHistoryEntity> {
    const entity = this.repository.create(data);
    return this.repository.save(entity);
  }

  async insertBulk(data: Partial<TrainingHistoryEntity>[]) {
    return this.repository.insert(data);
  }

  async softDelete(id: string): Promise<void> {
    await this.repository.softDelete(id);
  }

  async deleteByBiodataId(biodataId: string): Promise<void> {
    await this.repository.delete({ biodataId });
  }
}
