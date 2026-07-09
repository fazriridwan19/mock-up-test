import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { BiodataModule } from '../biodata/biodata.module';

@Module({
  imports: [BiodataModule],
  controllers: [AdminController],
})
export class AdminModule {}
