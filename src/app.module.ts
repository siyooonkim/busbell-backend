import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BusApiModule } from './busapi/busapi.module';
import { UsersModule } from './users/user.module';
import { NotificationsModule } from './notifications/notification.module';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './auth/auth.module';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';

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
      }),
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: () => ({
        store: redisStore as any,
        url: process.env.REDIS_URL, // 예: redis://localhost:6379
        ttl: 0, // 기본 TTL 없음(서비스별로 지정)
      }),
    }),
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
