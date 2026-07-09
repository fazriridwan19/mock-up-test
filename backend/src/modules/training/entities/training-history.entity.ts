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
import { BiodataEntity } from '../../biodata/entities/biodata.entity';

@Entity({ name: 'training_histories', synchronize: false })
export class TrainingHistoryEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'biodata_id', type: 'varchar', length: 36 })
  biodataId: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255 })
  organizer: string;

  @Column({ type: 'year' })
  year: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  duration?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  certificate?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date;

  @ManyToOne(() => BiodataEntity, (biodata) => biodata.trainingHistories, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'biodata_id' })
  biodata: BiodataEntity;
}
