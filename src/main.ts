import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS 설정 - 모든 origin 허용 (개발 환경)
  app.enableCors({
    origin: true,
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const doc = new DocumentBuilder()
    .setTitle('BusBell API')
    .setVersion('0.1.0')
    .build();

  const swarggerDoc = SwaggerModule.createDocument(app, doc);
  SwaggerModule.setup('docs', app, swarggerDoc);

  // 모든 네트워크 인터페이스에서 접근 가능하도록 0.0.0.0으로 설정
  const port = process.env.PORT ?? 3000;
  await app.listen(port, '0.0.0.0');

  console.log(`🚀 Server is running on http://0.0.0.0:${port}`);
  console.log(`📱 Access from mobile: http://192.168.0.20:${port}`);
  console.log(`📚 API Docs: http://localhost:${port}/docs`);
}
bootstrap();
