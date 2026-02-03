import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto } from './dto/create-department.dto';

@Controller('departments')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Post()
  create(@Body() createDepartmentDto: CreateDepartmentDto) {
    return this.departmentsService.create(createDepartmentDto);
  }

  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit = 10,
  ) {
    return this.departmentsService.findAll({ search, page, limit });
  }

  @Get(':id/subjects')
  findSubjects(
    @Param('id') id: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit = 10,
  ) {
    return this.departmentsService.findSubjects(+id, page, limit);
  }

  @Get(':id/classes')
  findClasses(
    @Param('id') id: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit = 10,
  ) {
    return this.departmentsService.findClasses(+id, page, limit);
  }

  @Get(':id/users')
  findUsers(
    @Param('id') id: string,
    @Query('role') role: 'teacher' | 'student',
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit = 10,
  ) {
    return this.departmentsService.findUsersInDepartment(
      +id,
      role,
      page,
      limit,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.departmentsService.findOne(+id);
  }
}
