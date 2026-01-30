import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

export enum ClassesStatus {
  active = 'active',
  inactive = 'inactive',
  archived = 'archived',
}

export class CreateClassDto {
  @IsString({ message: 'Name must be a string' })
  name: string;

  @IsNumber({}, { message: 'SubjectId must be a number' })
  subjectId: number;

  @IsNumber({}, { message: 'Capacity must be a number' })
  capacity: number;

  @IsString({ message: 'Description must be a string' })
  @IsOptional()
  description?: string;

  @IsEnum(ClassesStatus, { message: 'Status must be a valid enum value' })
  @IsOptional()
  status?: ClassesStatus;

  @IsString({ message: 'BannerUrl must be a string' })
  @IsOptional()
  bannerUrl?: string;

  @IsString({ message: 'BannerCldPubId must be a string' })
  @IsOptional()
  bannerCldPubId?: string;
}
