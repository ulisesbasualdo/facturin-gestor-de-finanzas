import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  Matches,
  Max,
  MaxLength,
} from 'class-validator';
import { YEAR_MONTH_PATTERN } from '../../common/year-month.js';

/** Monto máximo que entra en la columna DECIMAL(12,2). */
export const MAX_PRICE = 9999999999.99;
/** Largo máximo del título, igual al de la columna VARCHAR(255). */
export const MAX_TITLE_LENGTH = 255;

export class CreateItemDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty({ message: 'El título no puede estar vacío.' })
  @MaxLength(MAX_TITLE_LENGTH, {
    message: `El título puede tener hasta ${MAX_TITLE_LENGTH} caracteres.`,
  })
  title: string;

  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'El monto tiene que ser un número con hasta 2 decimales.' },
  )
  @IsPositive({ message: 'El monto tiene que ser mayor a 0.' })
  @Max(MAX_PRICE, { message: 'El monto es demasiado grande.' })
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
