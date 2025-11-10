import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('auth')
@Index(['userId'], { unique: true })
export class Auth {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'fcm_token', nullable: true })
  fcmToken: string | null;

  @Column({ name: 'refresh_token_hash', length: 255 })
  @Index()
  refreshTokenHash: string;

  @Column({ name: 'refresh_expires_at', type: 'timestamp' })
  refreshExpiresAt: Date;

  @Column({ name: 'last_login_at', type: 'timestamp' })
  lastLoginAt: Date;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
