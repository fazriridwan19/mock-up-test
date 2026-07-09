import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Degree } from '../../../common/enums/degree.enum';

export class CreateEducationHistoryDto {
  @ApiProperty({ example: 'Universitas Indonesia' })
  @IsString()
  @MinLength(2)
  institution: string;

  @ApiProperty({ example: 'Teknik Informatika' })
  @IsString()
  @MinLength(2)
  major: string;

  @ApiProperty({ enum: Degree, example: Degree.S1 })
  @IsEnum(Degree)
  degree: Degree;

  @ApiProperty({ example: 2016 })
  @IsInt()
  @Min(1950)
  @Max(2100)
  startYear: number;

  @ApiPropertyOptional({ example: 2020 })
  @IsOptional()
  @IsInt()
  @Min(1950)
  @Max(2100)
  endYear?: number;

  @ApiPropertyOptional({ example: 3.75 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(4)
  gpa?: number;
}

export class UpdateEducationHistoryDto extends CreateEducationHistoryDto {}
