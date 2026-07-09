import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { BiodataController } from './biodata.controller';
import { BiodataService } from './biodata.service';
import { BiodataRepository } from './repositories/biodata.repository';
import { BiodataEntity } from './entities/biodata.entity';
import { EducationModule } from '../education/education.module';
import { TrainingModule } from '../training/training.module';
import { EmploymentModule } from '../employment/employment.module';
import { BiodataProcessor } from '../../jobs/biodata.processor';
import { BIODATA_QUEUE } from '../../queues/biodata.queue';

@Module({
  imports: [
    TypeOrmModule.forFeature([BiodataEntity]),
    BullModule.registerQueue({ name: BIODATA_QUEUE }),
    EducationModule,
    TrainingModule,
    EmploymentModule,
  ],
  controllers: [BiodataController],
  providers: [BiodataService, BiodataRepository, BiodataProcessor],
  exports: [BiodataService],
})
export class BiodataModule {}
