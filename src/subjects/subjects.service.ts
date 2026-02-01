import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class SubjectsService {
  constructor(private prisma: PrismaService) {}

  async create(createSubjectDto: CreateSubjectDto) {
    const SubjectNameExists = await this.prisma.subject.findFirst({
      where: { name: createSubjectDto.name },
    });

    if (SubjectNameExists) {
      throw new ConflictException('Subject with this name already exists');
    }

    const SubjectCodeExists = await this.prisma.subject.findFirst({
      where: { code: createSubjectDto.code },
    });

    if (SubjectCodeExists) {
      throw new ConflictException('Subject with this code already exists');
    }

    return this.prisma.subject.create({
      data: createSubjectDto,
    });
  }

  async findOne(id: number) {
      if (!Number.isFinite(id)) {
        throw new NotFoundException('Invalid subject ID');
      }

      const subject = await this.prisma.subject.findUnique({
        where: { id },
        include: { department: true },
      })

      if (!subject) {
        throw new NotFoundException('Subject not found');
      }

      const classesCount = await this.prisma.class.count({
        where: { subjectId: id },
      })

      return {
        data: subject,
      }
    }

  async findAll(params: {
    search?: string;
    department?: string;
    page: number;
    limit: number;
  }) {
    const { search, department, page, limit } = params;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (department) {
      where.department = {
        name: { contains: department, mode: 'insensitive' },
      };
    }

    const [data, total] = await Promise.all([
      this.prisma.subject.findMany({
        where,
        include: { department: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.subject.count({ where }),
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

  async findSubjectClasses(id: number, page: number, limit: number) {
    const skip = (page - 1) * limit;

    if (!Number.isFinite(id)) {
      throw new NotFoundException('Invalid subject ID');
    }

    const [data, total] = await Promise.all([
      this.prisma.class.findMany({
        where: { subjectId: id },
        include: { teacher: true, subject: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.class.count({ where: { subjectId: id } }),
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

  async findUsersInSubject(id: number, role: 'teacher' | 'student', page: number, limit: number) {
    const skip = (page - 1) * limit;

    if (!Number.isFinite(id)) {
      throw new NotFoundException('Invalid subject ID');
    }

    if (role !== 'teacher' && role !== 'student') {
      throw new BadRequestException(`Role must be either 'teacher' or 'student'`);
    }
    

    const countResult = role === 'teacher' ? await this.prisma.user.count({
      where: {
        classes: {
          some: {
            subjectId: id,
          },
        }
      }
    }) : await this.prisma.user.count({
      where: {
        enrollments: {
          some: {
            class: {
              subjectId: id,
            }
          }
        }
      } 
    }); 

    const totalCount = countResult;

    const usersList = role === 'teacher' ? await this.prisma.user.findMany({
      where: {
        classes: {
          some: {
            subjectId: id,
          }
        }
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }) : await this.prisma.user.findMany({
      where: {
        enrollments: {
          some: {
            class: {
              subjectId: id,
            }
          }
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    })

    return {
      data: usersList,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  }
}
