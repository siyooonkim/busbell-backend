import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Auth } from '../../auth/entities/auth.entity';

@Injectable()
export class FcmService {
  constructor(
    config: ConfigService,
    @InjectRepository(Auth) private readonly authRepository: Repository<Auth>,
  ) {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: config.get('FIREBASE_PROJECT_ID'),
          clientEmail: config.get('FIREBASE_CLIENT_EMAIL'),
          privateKey: (config.get('FIREBASE_PRIVATE_KEY') || '').replace(
            /\\n/g,
            '\n',
          ),
        } as any),
      });
    }
  }

  async sendToUser(
    userId: number,
    payload: { title: string; body: string; data?: Record<string, string> },
  ) {
    // 해당 유저의 모든 활성 세션(디바이스)에 푸시 전송
    const authRecords = await this.authRepository.find({
      where: { userId, isActive: true },
    });

    const promises = authRecords
      .filter((auth) => auth.fcmToken)
      .map((auth) =>
        admin.messaging().send({
          token: auth.fcmToken!,
          notification: { title: payload.title, body: payload.body },
          data: payload.data || {},
        }),
      );

    await Promise.allSettled(promises);
  }
}
