import { Controller, Post, Body } from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';

@Controller('enrollments')
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Post()
  create(@Body() createEnrollmentDto: CreateEnrollmentDto) {
    return this.enrollmentsService.create(createEnrollmentDto);
  }

  @Post('join')
  joinClass(
    @Body() createEnrollmentDto: { inviteCode: string; studentId: string },
  ) {
    return this.enrollmentsService.joinClass(
      createEnrollmentDto.inviteCode,
      createEnrollmentDto.studentId,
    );
  }
}
