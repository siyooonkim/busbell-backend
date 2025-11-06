import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { NotificationLog } from './notifications-log.entity';
import { NotificationStatus } from '../enums/notification-status.enum';
import { NotificationType } from '../enums/notification-type.enum';

@Entity('notifications')
@Index(['userId', 'status'])
@Index(['status', 'nextPollAt'])
@Index(['status', 'expiresAt'])
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  // 버스 식별 정보
  @Column({ name: 'route_id', length: 100 })
  routeId: string;

  @Column({ name: 'city_code', type: 'int' })
  cityCode: number;

  @Column({ name: 'bus_number', length: 20 })
  busNumber: string;

  @Column({ nullable: true, length: 20 })
  direction: string | null;

  // 정류장 정보
  @Column({ name: 'stop_id', length: 100 })
  stopId: string;

  @Column({ name: 'stop_name', length: 200 })
  stopName: string;

  // 알림 설정
  @Column({
    name: 'notification_type',
    type: 'enum',
    enum: NotificationType,
  })
  notificationType: NotificationType;

  @Column({ name: 'minutes_before', nullable: true, type: 'int' })
  minutesBefore: number | null;

  @Column({ name: 'stops_before', nullable: true, type: 'int' })
  stopsBefore: number | null;

  // 상태 관리
  @Column({
    type: 'enum',
    enum: NotificationStatus,
    default: NotificationStatus.Reserved,
  })
  status: NotificationStatus;

  @Column({ name: 'last_eta_minutes', nullable: true, type: 'int' })
  lastEtaMinutes: number | null;

  @Column({ name: 'next_poll_at', nullable: true, type: 'timestamp' })
  nextPollAt: Date | null;

  @Column({ name: 'expires_at', type: 'timestamp' })
  expiresAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.notifications, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => NotificationLog, (log) => log.notification)
  logs: NotificationLog[];
}
