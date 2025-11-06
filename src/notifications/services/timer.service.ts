// src/notifications/timer.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../entities/notification.entity';
import { NotificationStatus } from '../enums/notification-status.enum';
import { BusApiService } from '../../busapi/services/busapi.service';
import { FcmService } from './fcm.service';

/**
 * ETA와 사용자 설정(minutesBefore or stopsBefore)에 따라
 * 다음 폴링 시점을 계산하는 함수
 */
function computeNextPollDelayMs(
  etaMinutes: number,
  alertMinutesBefore: number,
) {
  const minutesUntilAlert = etaMinutes - (alertMinutesBefore || 0);
  if (minutesUntilAlert >= 20) return 10 * 60_000; // 10분 후
  if (minutesUntilAlert >= 10) return 5 * 60_000; // 5분 후
  if (minutesUntilAlert >= 5) return 2 * 60_000; // 2분 후
  if (minutesUntilAlert >= 2) return 60_000; // 1분 후
  return 30_000; // 30초 후
}

@Injectable()
export class TimerService {
  /**
   * 메모리상에 현재 동작 중인 타이머를 관리 (중복 방지)
   * key: notificationId, value: setTimeout handle
   */
  private activeTimersByNotificationId = new Map<number, NodeJS.Timeout>();

  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
    private readonly busApi: BusApiService, // ETA 조회용
    private readonly fcm: FcmService, // FCM 발송용
  ) {}

  /** 특정 알림(notificationId)에 대한 폴링 시작 */
  async startPollingForNotification(notificationId: number) {
    // 기존 타이머 중복 방지
    this.stopPollingForNotification(notificationId);

    // 예약 정보 확인
    const reservation = await this.notificationRepo.findOneBy({
      id: notificationId,
    });
    if (!reservation || reservation.status !== NotificationStatus.Reserved)
      return;

    // 최초 1회 폴링 시작
    const handle = setTimeout(() => this.runPollingLoop(notificationId), 1000);
    this.activeTimersByNotificationId.set(notificationId, handle);
  }

  /** 특정 알림의 폴링 중지 (취소/완료 시 호출) */
  stopPollingForNotification(notificationId: number) {
    const handle = this.activeTimersByNotificationId.get(notificationId);
    if (handle) clearTimeout(handle);
    this.activeTimersByNotificationId.delete(notificationId);
  }

  /** 폴링 루프 한 사이클 */
  private async runPollingLoop(notificationId: number) {
    const reservation = await this.notificationRepo.findOneBy({
      id: notificationId,
    });
    if (!reservation || reservation.status !== NotificationStatus.Reserved) {
      return this.stopPollingForNotification(notificationId);
    }

    // ETA 조회
    const { etaMinutes } = await this.busApi.getArrivalInfo(
      reservation.routeId,
      reservation.stopId,
    );

    // 🔹 time 모드일 때: ETA 기반 알림
    if (reservation.notificationType === 'time') {
      const minutesBefore = reservation.minutesBefore ?? 0;
      const shouldNotify = etaMinutes <= minutesBefore;

      if (shouldNotify) {
        await this.sendArrivalNotification(reservation, etaMinutes);
        return;
      }

      // 다음 폴링 예약
      const nextDelayMs = computeNextPollDelayMs(etaMinutes, minutesBefore);
      const nextPollAt = new Date(Date.now() + nextDelayMs);
      await this.notificationRepo.update(reservation.id, {
        lastEtaMinutes: etaMinutes,
        nextPollAt,
      });

      const handle = setTimeout(
        () => this.runPollingLoop(notificationId),
        nextDelayMs,
      );
      this.activeTimersByNotificationId.set(notificationId, handle);
      return;
    }

    // 🔹 stops 모드일 때: 남은 정류장 수 기반 (추후 구현)
    if (reservation.notificationType === 'stops') {
      // TODO: 향후 BusApiService에서 남은 정류장 수 조회 기능 연동
      // const remainingStops = await this.busApi.getRemainingStops(...);
      // if (remainingStops <= reservation.stopsBefore) { ... }
    }
  }

  /** FCM 발송 + DB 업데이트 + 타이머 해제 */
  private async sendArrivalNotification(
    reservation: Notification,
    etaMinutes: number,
  ) {
    try {
      // await this.fcm.sendToUser(reservation.userId, {
      //   title: `${reservation.busId} 도착 임박`,
      //   body: `${reservation.stopId} 정류장에 곧 도착합니다.`,
      //   data: { notificationId: String(reservation.id) },
      // });
      console.log('푸시알림 전송');
    } finally {
      await this.notificationRepo.update(reservation.id, {
        status: NotificationStatus.Done,
        nextPollAt: null,
        lastEtaMinutes: etaMinutes,
      });
      this.stopPollingForNotification(reservation.id);
    }
  }
}
