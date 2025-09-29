import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BusApiModule } from './busapi/busapi.module';
import { UsersModule } from './users/user.module';
import { NotificationsModule } from './notifications/notification.module';

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
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),
    UsersModule,
    NotificationsModule,
    BusApiModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
