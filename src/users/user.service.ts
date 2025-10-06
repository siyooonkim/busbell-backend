import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
  ) {}

  async findById(id: number) {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('유저를 찾을 수 없습니다');
    return user;
  }

  async updateFcmToken(id: number, fcmToken: string) {
    await this.usersRepo.update({ id }, { fcmToken });
    return this.findById(id);
  }

  async softDelete(id: number) {
    // 실제 삭제 대신 soft delete or 비활성 처리 가능
    await this.usersRepo.update({ id }, { fcmToken: null });
    return { message: '회원 탈퇴 완료' };
  }
}
