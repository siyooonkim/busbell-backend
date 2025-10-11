import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { NotificationStatus } from '../notification-status.enum';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'bigint' })
  userId: number;

  @Column()
  busId: string;

  @Column()
  busDirection: string;

  @Column()
  stopId: string;

  @Column({ default: 'time' })
  notificationType: 'time' | 'stops';

  @Column({ type: 'int', nullable: true })
  minutesBefore: number | null;

  @Column({ type: 'int', nullable: true })
  stopsBefore: number | null;

  @Column({
    type: 'enum',
    enum: NotificationStatus,
    default: NotificationStatus.Reserved,
  })
  status: NotificationStatus;

  @Column({ type: 'timestamptz', nullable: true })
  nextPollAt: Date | null;

  @Column({ type: 'int', nullable: true })
  lastEtaMinutes: number | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
