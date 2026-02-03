import { IsString, Min, MinLength } from 'class-validator';

export class CreateDepartmentDto {
  code: string;

  @IsString({ message: 'Department name must be a string' })
  @MinLength(3, {
    message: 'Department name must be at least 3 characters long',
  })
  name: string;

  @IsString({ message: 'Description must be a string' })
  @MinLength(5, { message: 'Description must be at least 5 characters long' })
  description?: string;
}
