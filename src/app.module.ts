import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BusApiModule } from './busapi/modules/busapi.module';
import { UsersModule } from './users/modules/user.module';
import { NotificationsModule } from './notifications/modules/notification.module';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './auth/modules/auth.module';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        type: 'postgres',
        host: cfg.get('DB_HOST'),
        port: cfg.get<number>('DB_PORT'),
        username: cfg.get('DB_USER'),
        password: cfg.get('DB_PASS'),
        database: cfg.get('DB_NAME'),
        logging: true,
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),
    CacheModule.register({ isGlobal: true, ttl: 0 }),
    ScheduleModule.forRoot(),
    AuthModule,
    UsersModule,
    NotificationsModule,
    BusApiModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
