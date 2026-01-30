import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

type userType = {
  id: number;
  code: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(params: {
    search?: string;
    role?: string;
    page: number;
    limit: number;
  }) {
    const { search, role, page, limit } = params;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role) where.role = role;

    const totalCount = await this.prisma.user.count({ where });
    const userList = await this.prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: userList,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  }

  async findOne(id: string) {
    return await this.prisma.user.findFirst({
      where: { id },
    });
  }

  async getDepartments(userId: string, page: number, limit: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });

    if (!user) throw new NotFoundException('User not found');

    if (user.role !== 'teacher' && user.role !== 'student') {
      return {
        data: [],
        pagination: {
          page: 1,
          limit: 0,
          total: 0,
          totalPages: 0,
        },
      };
    }

    let departmentsList: userType[] = [];
    let totalCount = 0;

    if (user.role === 'teacher') {
      const departments = await this.prisma.department.findMany({
        where: {
          subjects: {
            some: {
              classes: {
                some: {
                  teacherId: userId,
                },
              },
            },
          },
        },
        distinct: ['id'],
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: (page - 1) * limit,
      });
      departmentsList = departments;
      totalCount = await this.prisma.department.count({
        where: {
          subjects: {
            some: {
              classes: {
                some: {
                  teacherId: userId,
                },
              },
            },
          },
        },
      });
    } else {
      const departments = await this.prisma.department.findMany({
        where: {
          subjects: {
            some: {
              classes: {
                some: {
                  enrollments: {
                    some: {
                      studentId: userId,
                    },
                  },
                },
              },
            },
          },
        },
        distinct: ['id'],
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: (page - 1) * limit,
      });
      departmentsList = departments;
      totalCount = await this.prisma.department.count({
        where: {
          subjects: {
            some: {
              classes: {
                some: {
                  enrollments: {
                    some: {
                      studentId: userId,
                    },
                  },
                },
              },
            },
          },
        },
      });
    }

    return {
      data: departmentsList,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  }

  async getSubjects(userId: string, page: number, limit: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });

    if (!user) throw new NotFoundException('User not found');

    if (user.role !== 'teacher' && user.role !== 'student') {
      return {
        data: [],
        pagination: {
          page: 1,
          limit: 0,
          total: 0,
          totalPages: 0,
        },
      };
    }

    let subjectsList: userType[] = [];
    let totalCount = 0;

    if (user.role === 'teacher') {
      const subjects = await this.prisma.subject.findMany({
        where: {
          classes: {
            some: {
              teacherId: userId,
            },
          },
        },
        distinct: ['id'],
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: (page - 1) * limit,
      });
      subjectsList = subjects;
      totalCount = await this.prisma.subject.count({
        where: {
          classes: {
            some: {
              teacherId: userId,
            },
          },
        },
      });
    } else {
      const subjects = await this.prisma.subject.findMany({
        where: {
          classes: {
            some: {
              enrollments: {
                some: {
                  studentId: userId,
                },
              },
            },
          },
        },
        distinct: ['id'],
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: (page - 1) * limit,
      });
      subjectsList = subjects;
      totalCount = await this.prisma.subject.count({
        where: {
          classes: {
            some: {
              enrollments: {
                some: {
                  studentId: userId,
                },
              },
            },
          },
        },
      });
    }

    return {
      data: subjectsList,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  }
}
