import { IsOptional, IsString, IsIn, MinLength } from 'class-validator';

export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'Title cannot be empty' })
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'Description cannot be empty' })
  description?: string;

  @IsOptional()
  @IsIn(['PENDING', 'IN_PROGRESS', 'DONE'], {
    message: 'Status must be PENDING, IN_PROGRESS, or DONE',
  })
  status?: string;
}
