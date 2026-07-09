import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmploymentHistoryEntity } from './entities/employment-history.entity';
import { EmploymentHistoryRepository } from './repositories/employment-history.repository';

@Module({
  imports: [TypeOrmModule.forFeature([EmploymentHistoryEntity])],
  providers: [EmploymentHistoryRepository],
  exports: [EmploymentHistoryRepository],
})
export class EmploymentModule {}
