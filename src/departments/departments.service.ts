import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class DepartmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDepartmentDto: CreateDepartmentDto) {
    const departmentCodeAlreadyExists = await this.prisma.department.findFirst({
      where: { code: createDepartmentDto.code },
    });

    if (departmentCodeAlreadyExists) {
      throw new ConflictException('Department with this code already exists');
    }

    const departmentNameAlreadyExists = await this.prisma.department.findFirst({
      where: { name: createDepartmentDto.name },
    });

    if (departmentNameAlreadyExists) {
      throw new ConflictException('Department with this name already exists');
    }

    return this.prisma.department.create({
      data: createDepartmentDto,
    });
  }

  async findAll(params: { search?: string; page: number; limit: number }) {
    const { search, page, limit } = params;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.department.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: { _count: { select: { subjects: true } } },
      }),
      this.prisma.department.count({ where }),
    ]);

    const departments = data.map((department) => ({
      ...department,
      totalSubjects: department._count.subjects,
    }));

    return {
      data: departments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    if (!Number.isFinite(id)) {
      throw new BadRequestException('Invalid department ID');
    }

    const department = await this.prisma.department.findUnique({
      where: { id },
    });

    if (!department) {
      throw new NotFoundException('Department not found');
    }

    const [subjectsCount, classesCount, enrolledStudentsCount] =
      await Promise.all([
        this.prisma.subject.count({ where: { departmentId: id } }),
        this.prisma.class.count({
          where: { subject: { departmentId: id } },
        }),
        this.prisma.enrollment.count({
          where: { class: { subject: { departmentId: id } } },
        }),
      ]);

    return {
      data: {
        department,
        totals: {
          subjectsCount,
          classesCount,
          enrolledStudentsCount,
        },
      },
    };
  }

  async findSubjects(departmentId: number, page: number, limit: number) {
    const skip = (page - 1) * limit;

    if (!Number.isFinite(departmentId)) {
      throw new BadRequestException('Invalid department ID');
    }

    const department = await this.prisma.department.findUnique({
      where: { id: departmentId },
    });

    if (!department) {
      throw new NotFoundException('Department not found');
    }

    const [data, total] = await Promise.all([
      this.prisma.subject.findMany({
        where: { departmentId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.subject.count({ where: { departmentId } }),
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

  async findClasses(departmentId: number, page: number, limit: number) {
    const skip = (page - 1) * limit;

    if (!Number.isFinite(departmentId)) {
      throw new BadRequestException('Invalid department ID');
    }

    const department = await this.prisma.department.findUnique({
      where: { id: departmentId },
    });

    if (!department) {
      throw new NotFoundException('Department not found');
    }

    const [data, total] = await Promise.all([
      this.prisma.class.findMany({
        where: { subject: { departmentId } },
        include: { subject: true, teacher: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.class.count({
        where: { subject: { departmentId } },
      }),
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

  async findUsersInDepartment(
    departmentId: number,
    role: 'teacher' | 'student',
    page: number,
    limit: number,
  ) {
    const skip = (page - 1) * limit;

    if (!Number.isFinite(departmentId)) {
      throw new BadRequestException('Invalid department ID');
    }

    const department = await this.prisma.department.findUnique({
      where: { id: departmentId },
    });

    if (!department) {
      throw new NotFoundException('Department not found');
    }

    if (role !== 'teacher' && role !== 'student') {
      throw new BadRequestException('Role must be either teacher or student');
    }

    const countResult =
      role === 'teacher'
        ? await this.prisma.user.count({
            where: {
              role: 'teacher',
              classes: {
                some: {
                  subject: {
                    departmentId: departmentId,
                  },
                },
              },
            },
          })
        : await this.prisma.user.count({
            where: {
              role: 'student',
              enrollments: {
                some: {
                  class: {
                    subject: {
                      departmentId: departmentId,
                    },
                  },
                },
              },
            },
          });

    const usersList =
      role === 'teacher'
        ? await this.prisma.user.findMany({
            where: {
              role: 'teacher',
              classes: {
                some: {
                  subject: {
                    departmentId: departmentId,
                  },
                },
              },
            },
            take: limit,
            skip,
            orderBy: { createdAt: 'desc' },
          })
        : await this.prisma.user.findMany({
            where: {
              role: 'student',
              enrollments: {
                some: {
                  class: {
                    subject: {
                      departmentId: departmentId,
                    },
                  },
                },
              },
            },
            take: limit,
            skip,
            orderBy: { createdAt: 'desc' },
          });

    return {
      data: usersList,
      pagination: {
        page,
        limit,
        total: countResult,
        totalPages: Math.ceil(countResult / limit),
      },
    };
  }
}
