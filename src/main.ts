import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const doc = new DocumentBuilder()
    .setTitle('BusBell API')
    .setVersion('0.1.0')
    .build();

  const swarggerDoc = SwaggerModule.createDocument(app, doc);
  SwaggerModule.setup('docs', app, swarggerDoc);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
