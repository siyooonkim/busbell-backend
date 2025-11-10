// 토큰을 어덯게 검증할지
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // 👈 헤더에서 Bearer 토큰 추출
      secretOrKey: process.env.JWT_SECRET || 'busbell-secret', // 👈 검증용 시크릿
    });
  }

  async validate(payload: any) {
    // payload = { sub: userId, email, iat, exp }
    return { userId: payload.sub, email: payload.email };
  }
}
