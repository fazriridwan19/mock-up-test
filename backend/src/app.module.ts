import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import redisConfig from './config/redis.config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { BiodataModule } from './modules/biodata/biodata.module';
import { EducationModule } from './modules/education/education.module';
import { TrainingModule } from './modules/training/training.module';
import { EmploymentModule } from './modules/employment/employment.module';
import { AdminModule } from './modules/admin/admin.module';
import { UserEntity } from './modules/users/entities/user.entity';
import { BiodataEntity } from './modules/biodata/entities/biodata.entity';
import { EducationHistoryEntity } from './modules/education/entities/education-history.entity';
import { TrainingHistoryEntity } from './modules/training/entities/training-history.entity';
import { EmploymentHistoryEntity } from './modules/employment/entities/employment-history.entity';
import { TransactionalModule } from './common/modules/transactional.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, jwtConfig, redisConfig],
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        username: configService.get<string>('database.username'),
        password: configService.get<string>('database.password'),
        database: configService.get<string>('database.database'),
        entities: [
          UserEntity,
          BiodataEntity,
          EducationHistoryEntity,
          TrainingHistoryEntity,
          EmploymentHistoryEntity,
        ],
        logging: configService.get<string>('APP_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),

    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('redis.host'),
          port: configService.get<number>('redis.port'),
        },
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 1000,
          },
          removeOnComplete: 100,
          removeOnFail: 50,
        },
      }),
      inject: [ConfigService],
    }),

    TransactionalModule,
    AuthModule,
    UsersModule,
    BiodataModule,
    EducationModule,
    TrainingModule,
    EmploymentModule,
    AdminModule,
  ],
})
export class AppModule {}
