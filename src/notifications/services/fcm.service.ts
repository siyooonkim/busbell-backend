import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Auth } from '../../auth/entities/auth.entity';

@Injectable()
export class FcmService {
  private readonly logger = new Logger(FcmService.name);

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

  async sendNotificationToUser(
    userId: number,
    payload: { title: string; body: string; data?: Record<string, string> },
    correlationId?: string,
  ) {
    const logPrefix = correlationId ? `[${correlationId}]` : '';
    
    const authRecords = await this.authRepository.find({
      where: { userId, isActive: true },
    });

    this.logger.log(`${logPrefix} FCM 발송 준비 - userId: ${userId}, 활성 디바이스: ${authRecords.length}개`);

    const tokensWithAuth = authRecords.filter((auth) => auth.fcmToken);
    
    if (tokensWithAuth.length === 0) {
      this.logger.warn(`${logPrefix} FCM 토큰 없음 - userId: ${userId}`);
      return;
    }

    tokensWithAuth.forEach((auth, index) => {
      this.logger.debug(`${logPrefix} FCM 토큰 ${index + 1}: ${auth.fcmToken?.substring(0, 20)}...`);
    });

    const promises = tokensWithAuth.map((auth) =>
      admin.messaging().send({
        token: auth.fcmToken!,
        notification: { title: payload.title, body: payload.body },
        data: payload.data || {},
      }),
    );

    const results = await Promise.allSettled(promises);
    
    const successCount = results.filter((r) => r.status === 'fulfilled').length;
    const failureCount = results.filter((r) => r.status === 'rejected').length;
    
    this.logger.log(`${logPrefix} FCM 발송 결과 - 성공: ${successCount}, 실패: ${failureCount}`);
    
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        this.logger.error(`${logPrefix} FCM 발송 실패 (토큰 ${index + 1}): ${result.reason?.message || result.reason}`);
      }
    });
  }
}
