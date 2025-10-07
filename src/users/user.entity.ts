// src/users/user.entity.ts
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';

@Entity('users')
@Unique(['email'])
export class User {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ nullable: true }) // 기존 fcmToken 유지
  fcmToken?: string;

  // 이메일/비밀번호용 필드 추가
  @Column({ nullable: true })
  email?: string;

  @Column({ nullable: true })
  passwordHash?: string; // 평문 X 반드시 해시

  @Column({ default: false })
  isEmailVerified: boolean;

  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
