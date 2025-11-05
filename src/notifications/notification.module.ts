import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';
import { TimerService } from './timer.service';
import { FcmService } from './fcm.service';
import { NotificationLog } from './entities/notifications-log.entity';
import { NotificationsController } from './notification.controller';
import { NotificationsService } from './notification.service';
import { BusApiModule } from 'src/busapi/busapi.module';
import { Auth } from 'src/auth/entities/auth.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification, NotificationLog, Auth]),
    BusApiModule,
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService, TimerService, FcmService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
