import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './notification.entity';
import { TimerService } from './timer.service';
import { FcmService } from './fcm.service';
import { UsersModule } from 'src/users/user.module';
import { NotificationLog } from './notifications-log.entity';
import { NotificationsController } from './notification.controller';
import { NotificationsService } from './notification.service';
import { BusApiModule } from 'src/busapi/busapi.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification, NotificationLog]),
    UsersModule,
    BusApiModule,
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService, TimerService, FcmService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
