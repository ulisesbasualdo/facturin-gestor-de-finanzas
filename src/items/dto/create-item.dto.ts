import { IsBoolean, IsNotEmpty, IsNumber, IsString, Matches } from 'class-validator';
import { YEAR_MONTH_PATTERN } from '../../common/year-month.js';

export class CreateItemDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  price: number;

  @IsBoolean()
  completed: boolean;

  @IsString()
  @Matches(YEAR_MONTH_PATTERN, {
    message: 'yearMonth debe tener el formato YYYY-MM (ej. 2026-01)',
  })
  yearMonth: string;

  @IsBoolean()
  isGain: boolean;
}
