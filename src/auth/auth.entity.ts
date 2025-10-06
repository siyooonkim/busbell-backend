import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('auth')
@Index(['phone'], { unique: true })
export class Auth {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'bigint' })
  userId: number;

  // 'phone' | 'kakao'
  @Column({ type: 'varchar', length: 20 })
  provider: 'phone' | 'kakao';

  // phone: 01012341234
  @Column({ type: 'varchar', length: 20 })
  phone: string;

  // kakaoId
  @Column({ type: 'varchar', length: 100 })
  kakaoId?: string;

  // RN에서 전달
  @Column({ type: 'varchar', length: 191 })
  deviceId: string;

  // ===== Refresh 저장(해시) =====
  @Column({ nullable: true })
  refreshTokenHash?: string; // bcrypt/argon2

  @Column({ type: 'timestamptz', nullable: true })
  refreshExpiresAt?: Date;

  @Column({ type: 'timestamptz', nullable: true })
  lastLoginAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
