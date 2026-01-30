import { Injectable } from '@nestjs/common';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
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

  async findAll(
    params: {
      search: string;
      department: string;
      subject: string;
      page: number;
      limit: number;
    }
  ) {
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
      }
    }

    if (subject) {
      where.subject = {
        name: { contains: subject, mode: 'insensitive' },
      }
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
    ])

    return {
      data, 
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    }

  }

  findOne(id: number) {
    return `This action returns a #${id} class`;
  }

  update(id: number, updateClassDto: UpdateClassDto) {
    return `This action updates a #${id} class`;
  }

  remove(id: number) {
    return `This action removes a #${id} class`;
  }
}
