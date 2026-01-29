// src/notifications/timer.service.ts
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { Notification } from '../entities/notification.entity';
import { NotificationStatus } from '../enums/notification-status.enum';
import { BusApiService } from '../../busapi/services/busapi.service';
import { FcmService } from './fcm.service';

/*
 * [DEPRECATED] 기존 동적 폴링 함수 - 심사 후 하이브리드 방식으로 복원 예정
 * ETA와 사용자 설정에 따라 다음 폴링 시점을 계산하던 함수
 *
function computeNextPollDelayMs(
  etaMinutes: number,
  alertMinutesBefore: number,
) {
  const minutesUntilAlert = etaMinutes - (alertMinutesBefore || 0);
  if (minutesUntilAlert >= 10) return 2 * 60_000;
  if (minutesUntilAlert >= 5) return 1 * 60_000;
  return 30_000;
}
*/

function computeSimplePollDelayMs(etaMinutes: number, alertMinutesBefore: number): number {
  const waitMinutes = etaMinutes - alertMinutesBefore;
  return waitMinutes > 0 ? waitMinutes * 60_000 : 0;
}

@Injectable()
export class TimerService implements OnModuleInit {
  private readonly logger = new Logger(TimerService.name);
  
  /**
   * 메모리상에 현재 동작 중인 타이머를 관리 (중복 방지)
   * key: notificationId, value: setTimeout handle
   */
  private activeTimersByNotificationId = new Map<number, NodeJS.Timeout>();
  
  /**
   * correlationId 저장 (폴링 동안 추적용)
   * key: notificationId, value: correlationId
   */
  private correlationIdsByNotificationId = new Map<number, string>();

  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
    private readonly busApi: BusApiService, // ETA 조회용
    private readonly fcm: FcmService, // FCM 발송용
  ) {}

  async onModuleInit() {
    this.logger.log('TimerService 초기화: Reserved 알림 복원 중...');

    const reservedNotifications = await this.notificationRepo.find({
      where: { status: NotificationStatus.Reserved },
    });

    this.logger.log(`복원할 알림: ${reservedNotifications.length}개`);

    for (const notification of reservedNotifications) {
      const correlationId = randomUUID();
      await this.startPollingForNotification(notification.id, correlationId);
      this.logger.log(`[${correlationId}] 알림 복원 - notificationId: ${notification.id}, userId: ${notification.userId}`);
    }
  }

  async validateInitialEta(
    routeId: string,
    stopId: string,
    cityCode: number,
    minutesBefore: number,
  ): Promise<{ valid: boolean; etaMinutes?: number; error?: string; suggestion?: string }> {
    try {
      const { arrivals } = await this.busApi.getArrivalInfo(
        routeId,
        stopId,
        cityCode,
      );

      if (!arrivals || arrivals.length === 0) {
        return {
          valid: false,
          error: '현재 운행 중인 버스가 없습니다.',
          suggestion: '잠시 후 다시 시도해주세요.',
        };
      }

      const etaMinutes = arrivals[0].etaMinutes;

      if (etaMinutes < minutesBefore) {
        const suggestedMinutes = Math.max(1, etaMinutes - 1);
        return {
          valid: false,
          etaMinutes,
          error: `현재 버스가 약 ${etaMinutes}분 후 도착 예정입니다. ${minutesBefore}분 전 알림은 버스가 ${minutesBefore}분 이상 남았을 때만 설정할 수 있어요.`,
          suggestion: etaMinutes > 1 ? `${suggestedMinutes}분 전 알림으로 다시 시도해보세요.` : null,
        };
      }

      return { valid: true, etaMinutes };
    } catch (error) {
      this.logger.error(`ETA 검증 에러: ${error.message}`, error.stack);
      return {
        valid: false,
        error: '버스 정보를 조회할 수 없습니다.',
        suggestion: '잠시 후 다시 시도해주세요.',
      };
    }
  }

  async startPollingForNotification(notificationId: number, correlationId?: string) {
    const corrId = correlationId || randomUUID();
    this.correlationIdsByNotificationId.set(notificationId, corrId);
    
    this.logger.log(`[${corrId}] 폴링 시작 요청 - notificationId: ${notificationId}`);

    this.stopPollingForNotification(notificationId);

    const reservation = await this.notificationRepo.findOneBy({
      id: notificationId,
    });

    if (!reservation) {
      this.logger.error(`[${corrId}] 알림을 찾을 수 없음 - notificationId: ${notificationId}`);
      return;
    }

    if (reservation.status !== NotificationStatus.Reserved) {
      this.logger.error(`[${corrId}] 상태가 Reserved가 아님 - status: ${reservation.status}`);
      return;
    }

    this.logger.log(`[${corrId}] 1초 후 첫 폴링 시작 예약`);
    const handle = setTimeout(() => {
      this.logger.log(`[${corrId}] 첫 폴링 실행 시작`);
      this.runPollingLoop(notificationId);
    }, 1000);
    this.activeTimersByNotificationId.set(notificationId, handle);
  }

  stopPollingForNotification(notificationId: number) {
    const handle = this.activeTimersByNotificationId.get(notificationId);
    if (handle) clearTimeout(handle);
    this.activeTimersByNotificationId.delete(notificationId);
    this.correlationIdsByNotificationId.delete(notificationId);
  }

  private async runPollingLoop(notificationId: number) {
    const corrId = this.correlationIdsByNotificationId.get(notificationId) || 'unknown';
    this.logger.log(`[${corrId}] 1회 체크 실행 - notificationId: ${notificationId}`);
    
    let reservation: Notification | null = null;
    
    try {
      reservation = await this.notificationRepo.findOneBy({
        id: notificationId,
      });

      if (!reservation) {
        this.logger.error(`[${corrId}] 알림을 찾을 수 없음 - 종료`);
        return this.stopPollingForNotification(notificationId);
      }

      if (reservation.status !== NotificationStatus.Reserved) {
        this.logger.log(`[${corrId}] 상태가 Reserved가 아님 (${reservation.status}) - 종료`);
        return this.stopPollingForNotification(notificationId);
      }

      this.logger.log(`[${corrId}] ETA 조회 중 - routeId: ${reservation.routeId}, stopId: ${reservation.stopId}`);

      const { arrivals } = await this.busApi.getArrivalInfo(
        reservation.routeId,
        reservation.stopId,
        reservation.cityCode,
      );

      const etaMinutes = arrivals[0]?.etaMinutes ?? Infinity;
      this.logger.log(`[${corrId}] ETA 조회 결과 - ${arrivals.length}대 도착 예정, 첫 번째 ETA: ${etaMinutes === Infinity ? '없음' : etaMinutes + '분'}`);

      if (etaMinutes === Infinity) {
        this.logger.warn(`[${corrId}] 버스 정보 없음 - 실패 푸시 발송`);
        await this.sendFailureNotification(reservation, corrId, '버스 정보 없음');
        return;
      }

      if (reservation.notificationType === 'time') {
        const minutesBefore = reservation.minutesBefore ?? 0;
        const shouldNotify = etaMinutes <= minutesBefore;

        this.logger.log(`[${corrId}] 조건 판단 - ETA: ${etaMinutes}분, 설정: ${minutesBefore}분 전, 발송 여부: ${shouldNotify}`);

        if (shouldNotify) {
          await this.sendArrivalNotification(reservation, etaMinutes, corrId);
          return;
        }

        this.logger.warn(`[${corrId}] 조건 미충족 (ETA: ${etaMinutes}분 > 설정: ${minutesBefore}분) - 실패 푸시 발송`);
        await this.sendFailureNotification(reservation, corrId, '조건 미충족');
        return;
      }

      if (reservation.notificationType === 'stops') {
        this.logger.warn(`[${corrId}] stops 모드는 아직 미구현 - 실패 푸시 발송`);
        await this.sendFailureNotification(reservation, corrId, 'stops 모드 미구현');
      }
    } catch (error) {
      this.logger.error(`[${corrId}] 체크 에러: ${error.message}`, error.stack);
      if (reservation) {
        await this.sendFailureNotification(reservation, corrId, 'API 오류');
      }
    }
  }

  private async sendArrivalNotification(
    reservation: Notification,
    etaMinutes: number,
    correlationId: string,
  ) {
    this.logger.log(`[${correlationId}] FCM 발송 시작 - userId: ${reservation.userId}, 버스: ${reservation.busNumber}`);
    
    try {
      await this.fcm.sendNotificationToUser(
        reservation.userId,
        {
          title: `${reservation.busNumber}번 버스 곧 도착`,
          body: `${reservation.stopName}에 ${reservation.minutesBefore}분 후 도착 예정입니다.`,
          data: {
            notificationId: String(reservation.id),
            routeId: reservation.routeId,
            stopId: reservation.stopId,
            busNumber: reservation.busNumber,
          },
        },
        correlationId,
      );

      this.logger.log(`[${correlationId}] FCM 발송 완료 - ${reservation.busNumber}번 → ${reservation.stopName}`);
    } catch (error) {
      this.logger.error(`[${correlationId}] FCM 발송 실패: ${error.message}`, error.stack);
    } finally {
      await this.notificationRepo.update(reservation.id, {
        status: NotificationStatus.Done,
        nextPollAt: null,
        lastEtaMinutes: etaMinutes,
      });
      this.stopPollingForNotification(reservation.id);
    }
  }

  private async sendFailureNotification(
    reservation: Notification,
    correlationId: string,
    reason: string,
  ) {
    this.logger.log(`[${correlationId}] 실패 푸시 발송 시작 - userId: ${reservation.userId}, 사유: ${reason}`);
    
    try {
      await this.fcm.sendNotificationToUser(
        reservation.userId,
        {
          title: '알림 실패',
          body: '버스 정보를 확인할 수 없었습니다. 다시 예약해주세요.',
          data: {
            notificationId: String(reservation.id),
            routeId: reservation.routeId,
            stopId: reservation.stopId,
            busNumber: reservation.busNumber,
            failureReason: reason,
          },
        },
        correlationId,
      );

      this.logger.log(`[${correlationId}] 실패 푸시 발송 완료`);
    } catch (error) {
      this.logger.error(`[${correlationId}] 실패 푸시 발송 에러: ${error.message}`, error.stack);
    } finally {
      await this.notificationRepo.update(reservation.id, {
        status: NotificationStatus.Expired,
        nextPollAt: null,
      });
      this.stopPollingForNotification(reservation.id);
    }
  }
}
