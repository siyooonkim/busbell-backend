import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';

@Injectable()
export class FcmService {
  constructor(
    cfg: ConfigService,
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: cfg.get('FIREBASE_PROJECT_ID'),
          clientEmail: cfg.get('FIREBASE_CLIENT_EMAIL'),
          privateKey: (cfg.get('FIREBASE_PRIVATE_KEY') || '').replace(
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
    const u = await this.users.findOneBy({ id: userId });
    if (!u?.fcmToken) return;
    await admin.messaging().send({
      token: u.fcmToken,
      notification: { title: payload.title, body: payload.body },
      data: payload.data || {},
    });
  }
}
