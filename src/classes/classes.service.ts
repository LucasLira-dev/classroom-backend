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
      }
    })
  }

  findAll() {
    return `This action returns all classes`;
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
