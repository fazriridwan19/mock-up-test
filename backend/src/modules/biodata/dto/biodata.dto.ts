import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Gender } from '../../../common/enums/gender.enum';
import { Religion } from '../../../common/enums/religion.enum';
import { BloodType } from '../../../common/enums/blood-type.enum';
import { MaritalStatus } from '../../../common/enums/marital-status.enum';
import { CreateEducationHistoryDto } from '../../education/dto/education-history.dto';
import { CreateTrainingHistoryDto } from '../../training/dto/training-history.dto';
import { CreateEmploymentHistoryDto } from '../../employment/dto/employment-history.dto';
import { Type } from 'class-transformer';

export class CreateBiodataDto {
  @ApiProperty({ example: 'Backend Developer' })
  @IsString()
  @MinLength(2)
  appliedPosition: string;

  @ApiProperty({ example: 'Budi Santoso' })
  @IsString()
  @MinLength(2)
  fullName: string;

  @ApiProperty({ example: '3201234567890001' })
  @IsString()
  @Length(16, 16, { message: 'NIK harus 16 digit' })
  nationalIdNumber: string;

  @ApiProperty({ example: 'Jakarta' })
  @IsString()
  birthPlace: string;

  @ApiProperty({ example: '1995-06-15' })
  @IsDateString()
  birthDate: string;

  @ApiProperty({ enum: Gender, example: Gender.MALE })
  @IsEnum(Gender)
  gender: Gender;

  @ApiProperty({ enum: Religion, example: Religion.ISLAM })
  @IsEnum(Religion)
  religion: Religion;

  @ApiPropertyOptional({ enum: BloodType, example: BloodType.A })
  @IsOptional()
  @IsEnum(BloodType)
  bloodType?: BloodType;

  @ApiProperty({ enum: MaritalStatus, example: MaritalStatus.SINGLE })
  @IsEnum(MaritalStatus)
  maritalStatus: MaritalStatus;

  @ApiProperty({ example: 'Jl. Contoh No. 123, Jakarta Selatan' })
  @IsString()
  @MinLength(10)
  ktpAddress: string;

  @ApiProperty({ example: 'Jl. Contoh No. 456, Depok' })
  @IsString()
  @MinLength(10)
  currentAddress: string;

  @ApiProperty({ example: 'budi@example.com' })
  @IsEmail({}, { message: 'Email tidak valid' })
  email: string;

  @ApiProperty({ example: '08123456789' })
  @IsString()
  @Length(9, 15, { message: 'Nomor telepon tidak valid' })
  phoneNumber: string;

  @ApiProperty({ example: '08198765432' })
  @IsString()
  @Length(9, 15, { message: 'Kontak darurat tidak valid' })
  emergencyContact: string;

  @ApiPropertyOptional({ example: 'TypeScript, React, NestJS' })
  @IsOptional()
  @IsString()
  skills?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  willingToBePlaced?: boolean;

  @ApiPropertyOptional({ example: 8000000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  expectedSalary?: number;

  @ApiPropertyOptional({ type: [CreateEducationHistoryDto] })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateEducationHistoryDto)
  educationHistories?: CreateEducationHistoryDto[];

  @ApiPropertyOptional({ type: [CreateTrainingHistoryDto] })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateTrainingHistoryDto)
  trainingHistories?: CreateTrainingHistoryDto[];

  @ApiPropertyOptional({ type: [CreateEmploymentHistoryDto] })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateEmploymentHistoryDto)
  employmentHistories?: CreateEmploymentHistoryDto[];
}

export class UpdateBiodataDto extends CreateBiodataDto {}
