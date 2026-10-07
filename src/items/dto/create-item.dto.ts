import { IsBoolean, IsNotEmpty, IsNumber, IsString, Matches } from 'class-validator';

export class CreateItemDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsNumber()
  price: number;

  @IsBoolean()
  completed: boolean;

  @IsString()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, {
    message: 'yearMonth debe tener el formato YYYY-MM (ej. 2026-01)',
  })
  yearMonth: string;

  @IsBoolean()
  isGain: boolean;
}
