import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Degree } from '../../../common/enums/degree.enum';
import { BiodataEntity } from '../../biodata/entities/biodata.entity';

@Entity({ name: 'education_histories', synchronize: false })
export class EducationHistoryEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'biodata_id', type: 'varchar', length: 36 })
  biodataId: string;

  @Column({ type: 'varchar', length: 255 })
  institution: string;

  @Column({ type: 'varchar', length: 255 })
  major: string;

  @Column({ type: 'enum', enum: Degree })
  degree: Degree;

  @Column({ name: 'start_year', type: 'year' })
  startYear: number;

  @Column({ name: 'end_year', type: 'year', nullable: true })
  endYear?: number;

  @Column({ type: 'decimal', precision: 4, scale: 2, nullable: true })
  gpa?: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date;

  @ManyToOne(() => BiodataEntity, (biodata) => biodata.educationHistories, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'biodata_id' })
  biodata: BiodataEntity;
}
