// src/notifications/timer.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './notification.entity';
import { NotificationStatus } from './notification-status.enum';
import { BusApiService } from '../busapi/busapi.service';
import { FcmService } from './fcm.service';

/** 다음 폴링까지 기다릴 시간(ms)을 계산한다.
 *  - etaMinutes: 현재 ETA(분)
 *  - alertMinutesBefore: 유저가 설정한 "몇 분 전" 알림값
 */
function computeNextPollDelayMs(
  etaMinutes: number,
  alertMinutesBefore: number,
) {
  const minutesUntilAlert = etaMinutes - (alertMinutesBefore || 0);
  if (minutesUntilAlert >= 20) return 10 * 60_000; // 10분 간격
  if (minutesUntilAlert >= 10) return 5 * 60_000; // 5분 간격
  if (minutesUntilAlert >= 5) return 2 * 60_000; // 2분 간격
  if (minutesUntilAlert >= 2) return 60_000; // 1분 간격
  return 30_000; // 막판: 30초 간격
}

@Injectable()
export class TimerService {
  /** 메모리상에서 실행 중인 타이머를 관리한다. (중복 방지용)
   *  key: notificationId, value: setTimeout 핸들
   */
  private activeTimersByNotificationId = new Map<number, NodeJS.Timeout>();

  /** DI(의존성 주입): Nest가 Repository/Service 인스턴스를 대신 만들어 넣어준다. */
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>, // 알림 예약 DB 접근자
    private readonly busApi: BusApiService, // ETA를 얻기 위한 외부 API 래퍼
    private readonly fcm: FcmService, // 푸시 발송기
  ) {}

  /** 지정한 예약(notificationId)에 대한 폴링을 시작하거나 재시작한다. */
  async startPollingForNotification(notificationId: number) {
    // 1) 혹시 이전에 걸린 타이머가 있으면 먼저 제거(중복 방지)
    this.stopPollingForNotification(notificationId);

    // 2) DB에서 최신 예약 상태를 읽어온다.
    const reservation = await this.notificationRepo.findOneBy({
      id: notificationId,
    });
    if (!reservation || reservation.status !== NotificationStatus.Reserved)
      return;

    // 4) 타임아웃 예약
    const timerHandle = setTimeout(() => this.runPollingLoop(notificationId));
    this.activeTimersByNotificationId.set(notificationId, timerHandle);
  }

  /** 해당 예약의 폴링을 중지한다. (취소/완료 시 호출) */
  stopPollingForNotification(notificationId: number) {
    const handle = this.activeTimersByNotificationId.get(notificationId);
    if (handle) clearTimeout(handle); // 타이머 해제
    this.activeTimersByNotificationId.delete(notificationId); // 맵에서 제거
  }

  /** 폴링 루프 한 사이클: ETA 조회 → 조건 판단 → (발사 or 다음 스케줄) */
  private async runPollingLoop(notificationId: number) {
    // 1) 최신 예약 상태 재확인 (취소/완료 되었을 수 있음)
    const reservation = await this.notificationRepo.findOneBy({
      id: notificationId,
    });
    if (!reservation || reservation.status !== NotificationStatus.Reserved) {
      return this.stopPollingForNotification(notificationId);
    }

    // 2) ETA(분) 조회
    const { etaMinutes } = await this.busApi.getArrivalInfo(
      reservation.busId,
      reservation.stopId,
    );

    // 3) 발사 조건: ETA <= 사용자가 설정한 minutesBefore
    const alertMinutesBefore = reservation.minutesBefore ?? 0;
    const shouldNotify = etaMinutes <= alertMinutesBefore;

    if (shouldNotify) {
      // 3-1) 조건 만족 → 푸시 발송 + 상태/로그 갱신 + 타이머 종료
      try {
        await this.fcm.sendToUser(reservation.userId, {
          title: `${reservation.busNumber} 도착 임박`,
          body: `${reservation.stopName}에 곧 도착`,
          data: { notificationId: String(reservation.id) },
        });
      } finally {
        await this.notificationRepo.update(reservation.id, {
          status: NotificationStatus.Done, // 완료 처리
          nextPollAt: null, // 이후 폴링 불필요
          lastEtaMinutes: etaMinutes, // 참고값 기록
        });
        this.stopPollingForNotification(notificationId);
      }
      return; // 이번 사이클 종료
    }

    // 4) 아직 때가 아님 → 다음 폴링 시각 계산 후 DB/메모리 모두 스케줄
    const nextDelayMs = computeNextPollDelayMs(etaMinutes, alertMinutesBefore);
    const nextPollAt = new Date(Date.now() + nextDelayMs);

    // 4-1) DB에 "다음 점검 시각"과 "최근 ETA"를 저장 (재부팅 복구용)
    await this.notificationRepo.update(reservation.id, {
      lastEtaMinutes: etaMinutes,
      nextPollAt,
    });

    // 4-2) 메모리 타이머 재설정
    const handle = setTimeout(
      () => this.runPollingLoop(notificationId),
      nextDelayMs,
    );
    this.activeTimersByNotificationId.set(notificationId, handle);
  }
}
