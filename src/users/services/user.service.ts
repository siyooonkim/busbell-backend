import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { UserProfileDto } from '../dtos/user-response.dto';

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

  async getProfile(id: number): Promise<UserProfileDto> {
    const user = await this.findById(id);
    return {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      createdAt: user.createdAt,
    };
  }

  async softDelete(id: number) {
    // isActive를 false로 설정
    await this.usersRepo.update({ id }, { isActive: false });
    return { message: '회원 탈퇴 완료' };
  }
}
