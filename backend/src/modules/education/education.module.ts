import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EducationHistoryEntity } from './entities/education-history.entity';
import { EducationHistoryRepository } from './repositories/education-history.repository';

@Module({
  imports: [TypeOrmModule.forFeature([EducationHistoryEntity])],
  providers: [EducationHistoryRepository],
  exports: [EducationHistoryRepository],
})
export class EducationModule {}
