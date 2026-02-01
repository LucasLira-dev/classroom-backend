import { IsNumber, IsString, MinLength } from 'class-validator';

export class CreateSubjectDto {
  @IsNumber()
  departmentId: number;

  @IsString({ message: 'Name must be a string' })
  @MinLength(3, { message: 'Name must be at least 3 characters long' })
  name: string;

  @IsString({ message: 'Code must be a string' })
  @MinLength(3, { message: 'Code must be at least 3 characters long' })
  code: string;

  @IsString({ message: 'Description must be a string' })
  @MinLength(5, { message: 'Description must be at least 5 characters long' })
  description: string;
}
