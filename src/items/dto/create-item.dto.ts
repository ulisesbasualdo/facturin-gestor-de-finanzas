import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateItemDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsNumber()
  price: number;

  @IsBoolean()
  completed: boolean;

  @IsString()
  @IsNotEmpty()
  yearMonth: string;
}
