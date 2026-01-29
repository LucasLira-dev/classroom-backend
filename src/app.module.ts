import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SubjectsModule } from './subjects/subjects.module';
import { PrismaService } from './prisma.service';
import { ConfigModule } from '@nestjs/config';
import { ArcjetModule, ArcjetGuard, detectBot, shield, slidingWindow } from '@arcjet/nest';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { auth } from './auth/auth.config';
import { UsersModule } from './users/users.module';
import { ClassesModule } from './classes/classes.module';
import 'dotenv/config';

if (!process.env.ARCJET_KEY && process.env.ARCJET_ENV !== 'test') {
  throw new Error('ARCJET_KEY environment variable is not defined.');
}

@Module({
  imports: [
    // AuthModule.forRoot({ auth }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ArcjetModule.forRoot({
      isGlobal: true,
      key: process.env.ARCJET_KEY!,
      rules: [
        // Shield protects your app from common attacks e.g. SQL injection
        shield({ mode: 'LIVE' }),
        // Create a bot detection rule
        detectBot({
          mode: 'LIVE', // Blocks requests. Use "DRY_RUN" to log only
          // Block all bots except the following
          allow: [
            'CATEGORY:SEARCH_ENGINE', // Google, Bing, etc
            'CATEGORY:PREVIEW', // Link previews e.g. Slack, Discord
          ],
        }),
        slidingWindow({
          mode: 'LIVE',
          interval: '1m',
          max: 5,
        }),
      ],
    }),
    SubjectsModule,
    UsersModule,
    ClassesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    PrismaService,
    {
      provide: APP_GUARD,
      useClass: ArcjetGuard,
    },
  ],
})
export class AppModule {}
