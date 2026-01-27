import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SubjectsModule } from './subjects/subjects.module';
// import { AuthModule } from '@thallesp/nestjs-better-auth';
// import { auth } from './auth/auth.config';
import { PrismaService } from './prisma.service';

@Module({
  imports: [SubjectsModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
