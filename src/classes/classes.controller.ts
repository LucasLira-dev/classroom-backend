import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ForbiddenException,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { ClassesService } from './classes.service';
import { CreateClassDto } from './dto/create-class.dto';
import { Session, UserSession } from '@thallesp/nestjs-better-auth';

@Controller('classes')
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  @Post()
  create(
    @Body() createClassDto: CreateClassDto,
    @Session() session: UserSession,
  ) {
    const user = session.user;
    if (user.role !== 'teacher') {
      throw new ForbiddenException('Only teachers can create classes');
    }

    const teacherId = user.id;

    return this.classesService.create(createClassDto, teacherId);
  }

  @Get()
  findAll(
    @Query('search') search: string,
    @Query('department') department: string,
    @Query('subject') subject: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.classesService.findAll({
      search,
      department,
      subject,
      page,
      limit,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.classesService.findOne(+id);
  }

  @Get(':id/users')
  async getClassUsers(
    @Param('id') id: string,
    @Query('role') role: 'teacher' | 'student',
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    try {
      return await this.classesService.getClassUsers(+id, role, page, limit);
    } catch (error) {
      return { error: error.message };
    }
  }
}
