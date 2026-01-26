import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SubjectsModule } from './subjects/subjects.module';

@Module({
  imports: [SubjectsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
