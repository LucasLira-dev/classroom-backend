import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateClassDto } from './dto/create-class.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class ClassesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createClassDto: CreateClassDto, teacherId: string) {
    return await this.prisma.class.create({
      data: {
        ...createClassDto,
        teacherId: teacherId,
        inviteCode: Math.random().toString(36).substring(2, 9),
        schedules: [],
      },
    });
  }

  async findAll(params: {
    search: string;
    department: string;
    subject: string;
    page: number;
    limit: number;
  }) {
    const { search, department, subject, page, limit } = params;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (department) {
      where.department = {
        name: { contains: department, mode: 'insensitive' },
      };
    }

    if (subject) {
      where.subject = {
        name: { contains: subject, mode: 'insensitive' },
      };
    }

    const [data, total] = await Promise.all([
      this.prisma.class.findMany({
        where,
        include: { subject: true, teacher: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.class.count({ where }),
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const classDetails = await this.prisma.class.findUnique({
      where: { id },
      include: {
        subject: {
          include: {
            department: true,
          },
        },
        teacher: true,
      },
    });

    if (!classDetails) {
      throw new NotFoundException(`Class with ID ${id} not found`);
    }

    return classDetails;
  }

  async getClassUsers(
    classId: number,
    role: 'teacher' | 'student',
    page: number,
    limit: number,
  ) {
    if (!Number.isFinite(classId)) {
      throw new NotFoundException(`Class with ID ${classId} not found`);
    }

    if (role !== 'teacher' && role !== 'student') {
      throw new BadRequestException(
        `Role must be either 'teacher' or 'student'`,
      );
    }

    const skip = (page - 1) * limit;

    if (role === 'teacher') {
      const classDetails = await this.prisma.class.findUnique({
        where: { id: classId },
        include: { teacher: true },
      });

      const teachersList =
        classDetails && classDetails.teacher ? [classDetails.teacher] : [];

      return {
        data: teachersList,
        pagination: {
          page,
          limit,
          total: teachersList.length,
          totalPages: 1,
        },
      };
    }

    const [totalStudents, students] = await Promise.all([
      this.prisma.enrollment.count({
        where: {
          classId,
          student: { role: 'student' },
        },
      }),
      this.prisma.enrollment.findMany({
        where: {
          classId,
          student: { role: 'student' },
        },
        include: { student: true },
        skip,
        take: limit,
        orderBy: { student: { createdAt: 'desc' } },
      }),
    ]);

    return {
      data: students.map((e) => e.student),
      pagination: {
        page,
        limit,
        total: totalStudents,
        totalPages: Math.ceil(totalStudents / limit),
      },
    };
  }
}
