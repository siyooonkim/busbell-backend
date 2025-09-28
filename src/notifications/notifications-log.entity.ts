import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('notification_logs')
export class NotificationLog {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'bigint' })
  notificationId: number;

  @Column() busNumber: string;

  @Column({ default: 'sent' }) // 'sent' | 'failed'
  result: string;

  @Column({ nullable: true }) errorCode?: string;
  @Column({ nullable: true }) errorMessage?: string;

  @CreateDateColumn() createdAt: Date;
}
