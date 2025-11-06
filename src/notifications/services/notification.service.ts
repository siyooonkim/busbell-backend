import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../entities/notification.entity';
import { NotificationStatus } from '../enums/notification-status.enum';
import { TimerService } from './timer.service';
import { CreateNotificationDto } from '../dtos/create-notifications.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly repo: Repository<Notification>,
    private readonly timers: TimerService,
  ) {}

  async create(userId: number, dto: CreateNotificationDto) {
    const n = this.repo.create({
      ...dto,
      userId,
      status: NotificationStatus.Reserved,
      nextPollAt: new Date(), // 즉시 한 번 확인
    });
    const saved = await this.repo.save(n);
    await this.timers.startPollingForNotification(saved.id); // ✅ 예약 직후 이 예약만 폴링 시작
    return saved;
  }

  async cancel(id: number) {
    await this.repo.update(id, {
      status: NotificationStatus.Canceled,
      nextPollAt: null,
    });
    this.timers.stopPollingForNotification(id); // ✅ 즉시 폴링 중단
    return { ok: true };
  }

  async findAll(userId: number) {
    return this.repo.find({ where: { userId }, order: { id: 'DESC' } });
  }
}
