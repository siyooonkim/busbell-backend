import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Notification } from './notification.entity';

export enum NotificationLogStatus {
  Sent = 'sent',
  Error = 'error',
}

@Entity('notification_logs')
@Index(['notificationId'])
@Index(['createdAt'])
export class NotificationLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'notification_id' })
  notificationId: number;

  @Column({
    type: 'enum',
    enum: NotificationLogStatus,
  })
  status: NotificationLogStatus;

  @Column({ name: 'error_message', nullable: true, type: 'text' })
  errorMessage: string | null;

  @Column({ name: 'sent_at', type: 'timestamp' })
  sentAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => Notification, (notification) => notification.logs, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'notification_id' })
  notification: Notification;
}
