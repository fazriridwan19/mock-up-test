import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrainingHistoryEntity } from './entities/training-history.entity';
import { TrainingHistoryRepository } from './repositories/training-history.repository';

@Module({
  imports: [TypeOrmModule.forFeature([TrainingHistoryEntity])],
  providers: [TrainingHistoryRepository],
  exports: [TrainingHistoryRepository],
})
export class TrainingModule {}
