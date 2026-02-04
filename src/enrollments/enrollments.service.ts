import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class EnrollmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async getEnrollmentDetails(enrollmentId: number) {
    // Adjust select fields as needed to correspond to your Prisma schema relationships
    return this.prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        class: {
          include: {
            subject: {
              include: {
                department: true,
              },
            },
            teacher: true,
          },
        },
        student: true,
      },
    });
  }

  async create(createEnrollmentDto: CreateEnrollmentDto) {
    if (!createEnrollmentDto.classId || !createEnrollmentDto.studentId) {
      throw new BadRequestException('classId and studentId are required');
    }

    const existingClass = await this.prisma.class.findUnique({
      where: { id: createEnrollmentDto.classId },
    });

    if (!existingClass) {
      throw new BadRequestException('Class does not exist');
    }

    const existingStudent = await this.prisma.user.findUnique({
      where: { id: createEnrollmentDto.studentId },
    });

    if (!existingStudent) {
      throw new BadRequestException('Student does not exist');
    }

    const existingEnrollment = await this.prisma.enrollment.findFirst({
      where: {
        classId: createEnrollmentDto.classId,
        studentId: createEnrollmentDto.studentId,
      },
    });

    if (existingEnrollment) {
      throw new ConflictException('Student is already enrolled in this class');
    }

    const createdEnrollment = await this.prisma.enrollment.create({
      data: {
        classId: createEnrollmentDto.classId,
        studentId: createEnrollmentDto.studentId,
      },
    });

    const enrollment = await this.getEnrollmentDetails(createdEnrollment.id);

    return {
      data: enrollment,
    };
  }

  async joinClass(inviteCode: string, studentId: string) {
    if (!inviteCode || !studentId) {
      throw new BadRequestException('inviteCode and studentId are required');
    }

    const trimmedInviteCode = inviteCode.trim();

    const existingClass = await this.prisma.class.findFirst({
      where: { inviteCode: trimmedInviteCode, status: 'active' },
    })

    if (!existingClass) {
      throw new BadRequestException('Invalid invite code');
    }

    const existingStudent = await this.prisma.user.findUnique({
      where: { id: studentId },
    });

    if (!existingStudent) {
      throw new BadRequestException('Student does not exist');
    }

    const existingEnrollment = await this.prisma.enrollment.findFirst({
      where: {
        classId: existingClass.id,
        studentId: studentId,
      },
    });

    if (existingEnrollment) {
      throw new ConflictException('Student is already enrolled in this class');
    }

    const createdEnrollment = await this.prisma.enrollment.create({
      data: {
        classId: existingClass.id,
        studentId: studentId,
      },
    });

    const enrollment = await this.getEnrollmentDetails(createdEnrollment.id);

    return {
      data: enrollment,
    };
  }
}

  