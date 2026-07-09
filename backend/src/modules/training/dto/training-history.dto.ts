import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTrainingHistoryDto {
  @ApiProperty({ example: 'Web Development Bootcamp' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ example: 'Dicoding Indonesia' })
  @IsString()
  @MinLength(2)
  organizer: string;

  @ApiProperty({ example: 2022 })
  @IsInt()
  @Min(1950)
  @Max(2100)
  year: number;

  @ApiPropertyOptional({ example: '3 bulan' })
  @IsOptional()
  @IsString()
  duration?: string;

  @ApiPropertyOptional({ example: 'CERT-2022-001' })
  @IsOptional()
  @IsString()
  certificate?: string;
}

export class UpdateTrainingHistoryDto extends CreateTrainingHistoryDto {}
