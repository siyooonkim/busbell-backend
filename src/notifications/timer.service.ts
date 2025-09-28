import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { Notification } from './notification.entity';
import { NotificationStatus } from './notification-status.enum';
import { BusApiService } from '../busapi/busapi.service';
import { FcmService } from './fcm.service';

function nextDelayMs(eta: number, minutesBefore: number) {
  const left = eta - (minutesBefore || 0);
  if (left >= 20) return 10 * 60_000;
  if (left >= 10) return 5 * 60_000;
  if (left >= 5) return 2 * 60_000;
  if (left >= 2) return 60_000;
  return 30_000;
}
const jitter = (ms: number) => {
  const d = Math.floor(ms * 0.1);
  return ms + (Math.random() * 2 * d - d);
};

@Injectable()
export class TimerService {
  private timers = new Map<number, NodeJS.Timeout>(); // notificationId -> timeout

  constructor(
    @InjectRepository(Notification)
    private readonly repo: Repository<Notification>,
    private readonly bus: BusApiService,
    private readonly fcm: FcmService,
  ) {}

  async start(notificationId: number) {
    this.stop(notificationId); // ✅ 중복 방지
    const n = await this.repo.findOneBy({ id: notificationId });
    if (!n || n.status !== NotificationStatus.Reserved) return;

    const now = Date.now();
    const delay = Math.max(0, (n.nextPollAt?.getTime() ?? now) - now);
    const t = setTimeout(() => this.loop(notificationId), jitter(delay));
    this.timers.set(notificationId, t);
  }

  stop(notificationId: number) {
    const t = this.timers.get(notificationId);
    if (t) clearTimeout(t);
    this.timers.delete(notificationId);
  }

  private async loop(notificationId: number) {
    const n = await this.repo.findOneBy({ id: notificationId });
    if (!n || n.status !== NotificationStatus.Reserved)
      return this.stop(notificationId);

    const eta = await this.bus.getEtaMinutes(n.busId, n.stopId);

    if (eta <= (n.minutesBefore ?? 0)) {
      try {
        await this.fcm.sendToUser(n.userId, {
          title: `${n.busNumber} 도착 임박`,
          body: `${n.stopName}에 곧 도착`,
          data: { notificationId: String(n.id) },
        });
      } finally {
        await this.repo.update(n.id, {
          status: NotificationStatus.Done,
          nextPollAt: null,
          lastEtaMinutes: eta,
        });
        this.stop(notificationId);
      }
      return;
    }

    const delay = nextDelayMs(eta, n.minutesBefore ?? 0);
    const nextAt = new Date(Date.now() + delay);
    await this.repo.update(n.id, { lastEtaMinutes: eta, nextPollAt: nextAt });

    const t = setTimeout(() => this.loop(notificationId), delay);
    this.timers.set(notificationId, t);
  }

  // (선택) 지금 확인해야 할 것만 한 번에 시작하고 싶을 때 쓰는 헬퍼
  async kickDueOnce(limit = 100) {
    const due = await this.repo.find({
      where: {
        status: NotificationStatus.Reserved,
        nextPollAt: LessThanOrEqual(new Date()),
      },
      take: limit,
      order: { nextPollAt: 'ASC' },
    });
    for (const n of due) this.start(n.id);
  }
}
