// 토큰을 어덯게 검증할지
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // 👈 헤더에서 Bearer 토큰 추출
      secretOrKey: process.env.JWT_SECRET || 'busbell-secret', // 👈 검증용 시크릿
    });
    console.log('✅ JwtStrategy initialized with User repository');
  }

  async validate(payload: any) {
    // payload = { sub: userId, email, iat, exp }
    const userId = payload.sub;

    // 1. 유저 존재 여부 확인
    const user = await this.userRepo.findOne({ where: { id: userId } });

    if (!user) {
      throw new UnauthorizedException('유저를 찾을 수 없습니다');
    }

    // 2. 탈퇴한 유저인지 확인 (isActive = false)
    if (!user.isActive) {
      console.log('❌ 탈퇴한 유저 접근 시도');
      throw new UnauthorizedException('탈퇴한 유저입니다');
    }

    return { userId: user.id, email: user.email };
  }
}
