import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BloodType } from '../../../common/enums/blood-type.enum';
import { Gender } from '../../../common/enums/gender.enum';
import { MaritalStatus } from '../../../common/enums/marital-status.enum';
import { Religion } from '../../../common/enums/religion.enum';
import { EducationHistoryEntity } from '../../education/entities/education-history.entity';
import { EmploymentHistoryEntity } from '../../employment/entities/employment-history.entity';
import { TrainingHistoryEntity } from '../../training/entities/training-history.entity';
import { UserEntity } from '../../users/entities/user.entity';

@Entity({ name: 'biodata', synchronize: false })
export class BiodataEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'varchar', length: 36 })
  userId: string;

  @Column({ name: 'applied_position', type: 'varchar', length: 255 })
  appliedPosition: string;

  @Column({ name: 'full_name', type: 'varchar', length: 255 })
  fullName: string;

  @Column({
    name: 'national_id_number',
    type: 'varchar',
    length: 16,
    unique: true,
  })
  nationalIdNumber: string;

  @Column({ name: 'birth_place', type: 'varchar', length: 255 })
  birthPlace: string;

  @Column({ name: 'birth_date', type: 'date' })
  birthDate: Date;

  @Column({ type: 'enum', enum: Gender })
  gender: Gender;

  @Column({ type: 'enum', enum: Religion })
  religion: Religion;

  @Column({ name: 'blood_type', type: 'enum', enum: BloodType, nullable: true })
  bloodType?: BloodType;

  @Column({ name: 'marital_status', type: 'enum', enum: MaritalStatus })
  maritalStatus: MaritalStatus;

  @Column({ name: 'ktp_address', type: 'text' })
  ktpAddress: string;

  @Column({ name: 'current_address', type: 'text' })
  currentAddress: string;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ name: 'phone_number', type: 'varchar', length: 20 })
  phoneNumber: string;

  @Column({ name: 'emergency_contact', type: 'varchar', length: 20 })
  emergencyContact: string;

  @Column({ type: 'text', nullable: true })
  skills?: string;

  @Column({
    name: 'willing_to_be_placed',
    type: 'tinyint',
    default: 0,
    transformer: {
      to: (value: boolean) => (value ? 1 : 0),
      from: (value: number | boolean) => Boolean(value),
    },
  })
  willingToBePlaced: boolean;

  @Column({
    name: 'expected_salary',
    type: 'decimal',
    precision: 15,
    scale: 2,
    default: 0,
  })
  expectedSalary: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date;

  @OneToOne(() => UserEntity, (user) => user.biodata)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @OneToMany(() => EducationHistoryEntity, (edu) => edu.biodata, {
    cascade: true,
    eager: false,
  })
  educationHistories: EducationHistoryEntity[];

  @OneToMany(() => TrainingHistoryEntity, (training) => training.biodata, {
    cascade: true,
    eager: false,
  })
  trainingHistories: TrainingHistoryEntity[];

  @OneToMany(() => EmploymentHistoryEntity, (emp) => emp.biodata, {
    cascade: true,
    eager: false,
  })
  employmentHistories: EmploymentHistoryEntity[];
}
