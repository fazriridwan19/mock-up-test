import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiCookieAuth } from '@nestjs/swagger';
import { BiodataService } from './biodata.service';
import { CreateBiodataDto, UpdateBiodataDto } from './dto/biodata.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '../../common/enums/role.enum';
import { UserEntity } from '../users/entities/user.entity';

@ApiTags('Biodata')
@ApiCookieAuth('access_token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('biodata')
export class BiodataController {
  constructor(private readonly biodataService: BiodataService) {}

  @Get()
  @Roles(Role.USER, Role.ADMIN)
  @ApiOperation({ summary: 'Get my biodata' })
  async getMyBiodata(@CurrentUser() user: UserEntity) {
    const data = await this.biodataService.getMyBiodata(user.id);
    return { success: true, message: 'Biodata berhasil diambil', data };
  }

  @Get('jobs/:jobId')
  @Roles(Role.USER, Role.ADMIN)
  @ApiOperation({ summary: 'Poll job status for async mutations' })
  async getJobStatus(@Param('jobId') jobId: string) {
    const data = await this.biodataService.getJobStatus(jobId);
    return { success: true, message: 'Status job berhasil diambil', data };
  }

  @Post()
  @Roles(Role.USER)
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Enqueue biodata creation (async)' })
  async createBiodata(
    @CurrentUser() user: UserEntity,
    @Body() dto: CreateBiodataDto,
  ) {
    const jobId = await this.biodataService.enqueueCreate(user.id, dto);
    return {
      success: true,
      message: 'Permintaan pembuatan biodata sedang diproses',
      data: { jobId },
    };
  }

  @Put()
  @Roles(Role.USER)
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Enqueue biodata update (async)' })
  async updateBiodata(
    @CurrentUser() user: UserEntity,
    @Body() dto: UpdateBiodataDto,
  ) {
    const jobId = await this.biodataService.enqueueUpdate(user.id, dto);
    return {
      success: true,
      message: 'Permintaan perubahan biodata sedang diproses',
      data: { jobId },
    };
  }

  @Delete()
  @Roles(Role.USER)
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Enqueue biodata deletion (async)' })
  async deleteBiodata(@CurrentUser() user: UserEntity) {
    const jobId = await this.biodataService.enqueueDelete(user.id);
    return {
      success: true,
      message: 'Permintaan penghapusan biodata sedang diproses',
      data: { jobId },
    };
  }
}
