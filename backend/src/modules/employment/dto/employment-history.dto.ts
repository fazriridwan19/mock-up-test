import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEmploymentHistoryDto {
  @ApiProperty({ example: 'PT. Contoh Perusahaan' })
  @IsString()
  @MinLength(2)
  company: string;

  @ApiProperty({ example: 'Software Engineer' })
  @IsString()
  @MinLength(2)
  position: string;

  @ApiProperty({ example: '2020-01-01' })
  @IsDateString()
  startDate: string;

  @ApiPropertyOptional({ example: '2023-12-31' })
  @Transform(({ value }: { value: unknown }) =>
    value === '' || value === null ? undefined : value,
  )
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ example: 8000000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  salary?: number;

  @ApiPropertyOptional({
    example: 'Bertanggung jawab atas pengembangan aplikasi web',
  })
  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateEmploymentHistoryDto extends CreateEmploymentHistoryDto {}
