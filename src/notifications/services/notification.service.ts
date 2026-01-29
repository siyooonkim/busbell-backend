import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { randomUUID } from 'crypto';
import { Notification } from '../entities/notification.entity';
import { NotificationStatus } from '../enums/notification-status.enum';
import { TimerService } from './timer.service';
import { CreateNotificationDto } from '../dtos/create-notifications.dto';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
    private readonly timers: TimerService,
  ) {}

  async createNotification(userId: number, dto: CreateNotificationDto) {
    const correlationId = randomUUID();
    this.logger.log(`[${correlationId}] 알림 생성 시작 - userId: ${userId}, 버스: ${dto.busNumber}, 정류장: ${dto.stopName}`);

    // 1. 이미 예약된 알림이 있는지 확인
    const existingReservation = await this.notificationRepo.findOne({
      where: {
        userId,
        status: NotificationStatus.Reserved,
      },
    });

    if (existingReservation) {
      this.logger.warn(`[${correlationId}] 이미 예약된 알림 존재 - 기존 알림 ID: ${existingReservation.id}`);
      throw new ConflictException(
        '이미 예약된 알림이 있습니다. 기존 알림을 취소한 후 다시 시도해주세요.',
      );
    }

    // 2. time 모드인 경우 실시간 버스 ETA 검증
    if (dto.notificationType === 'time' && dto.minutesBefore) {
      this.logger.log(`[${correlationId}] ETA 검증 시작 - routeId: ${dto.routeId}, stopId: ${dto.stopId}, cityCode: ${dto.cityCode}`);
      
      const validation = await this.timers.validateInitialEta(
        dto.routeId,
        dto.stopId,
        dto.cityCode,
        dto.minutesBefore,
      );

      if (!validation.valid) {
        this.logger.warn(`[${correlationId}] ETA 검증 실패 - ${validation.error}`);
        throw new BadRequestException({
          message: validation.error,
          suggestion: validation.suggestion,
        });
      }

      this.logger.log(`[${correlationId}] ETA 검증 통과 - 버스 도착 ${validation.etaMinutes}분, 알림 ${dto.minutesBefore}분 전`);
    }

    // 3. 알림 만료 시간 설정 (생성 시점으로부터 24시간 후)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const notification = this.notificationRepo.create({
      userId,
      ...dto,
      status: NotificationStatus.Reserved,
      nextPollAt: new Date(), // 즉시 한 번 확인
      expiresAt, // 만료  설정
    });
    const saved = await this.notificationRepo.save(notification);
    
    this.logger.log(`[${correlationId}] 알림 생성 완료 - notificationId: ${saved.id}`);
    
    await this.timers.startPollingForNotification(saved.id, correlationId);
    return {
      message: '알림이 설정되었습니다.',
      data: saved,
    };
  }

  async cancelNotification(id: number, userId: number) {
    // 1. notification 존재 여부 및 소유권 확인
    const notification = await this.notificationRepo.findOne({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundException('알림을 찾을 수 없습니다.');
    }

    // 2. 본인의 알림인지 확인
    if (notification.userId !== userId) {
      throw new NotFoundException('알림을 찾을 수 없습니다.');
    }

    // 3. 상태 업데이트
    notification.status = NotificationStatus.Canceled;
    notification.nextPollAt = null;
    await this.notificationRepo.save(notification);

    // 4. 폴링 중단
    this.timers.stopPollingForNotification(id);

    return { message: '알림이 삭제되었습니다.' };
  }

  async findAllNotifications(userId: number) {
    const notifications = await this.notificationRepo.find({
      where: {
        userId,
        status: NotificationStatus.Reserved,
        // expiresAt: MoreThan(new Date()),
      },
      order: { id: 'DESC' },
    });
    return {
      message: '활성 알림 목록을 조회했습니다.',
      data: notifications,
    };
  }
}
