import {
  Controller,
  Get,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiCookieAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { BiodataService } from '../biodata/biodata.service';
import { UpdateBiodataDto } from '../biodata/dto/biodata.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

@ApiTags('Admin')
@ApiCookieAuth('access_token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private readonly biodataService: BiodataService) {}

  @Get('biodata')
  @ApiOperation({ summary: 'Get all biodata (admin only)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'appliedPosition', required: false })
  @ApiQuery({ name: 'latestEducation', required: false })
  async getAllBiodata(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('search') search?: string,
    @Query('appliedPosition') appliedPosition?: string,
    @Query('latestEducation') latestEducation?: string,
  ) {
    const result = await this.biodataService.getAdminBiodataList({
      page,
      limit,
      search,
      appliedPosition,
      latestEducation,
    });
    return {
      success: true,
      message: 'Data biodata berhasil diambil',
      data: result.data,
      meta: result.meta,
    };
  }

  @Get('biodata/:id')
  @ApiOperation({ summary: 'Get biodata detail (admin only)' })
  async getBiodataById(@Param('id') id: string) {
    const data = await this.biodataService.getAdminBiodataById(id);
    return { success: true, message: 'Detail biodata berhasil diambil', data };
  }

  @Get('jobs/:jobId')
  @ApiOperation({ summary: 'Poll admin job status' })
  async getJobStatus(@Param('jobId') jobId: string) {
    const data = await this.biodataService.getJobStatus(jobId);
    return { success: true, message: 'Status job berhasil diambil', data };
  }

  @Put('biodata/:id')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Enqueue biodata update by id (admin, async)' })
  async updateBiodata(@Param('id') id: string, @Body() dto: UpdateBiodataDto) {
    const jobId = await this.biodataService.enqueueAdminUpdate(id, dto);
    return {
      success: true,
      message: 'Permintaan perubahan biodata sedang diproses',
      data: { jobId },
    };
  }

  @Delete('biodata/:id')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Enqueue biodata deletion by id (admin, async)' })
  async deleteBiodata(@Param('id') id: string) {
    const jobId = await this.biodataService.enqueueAdminDelete(id);
    return {
      success: true,
      message: 'Permintaan penghapusan biodata sedang diproses',
      data: { jobId },
    };
  }
}
