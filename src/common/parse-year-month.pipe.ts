import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { YEAR_MONTH_PATTERN } from './year-month.js';

/** Valida que un parámetro de ruta tenga el formato `YYYY-MM`. */
@Injectable()
export class ParseYearMonthPipe implements PipeTransform<string, string> {
  transform(value: string): string {
    if (!YEAR_MONTH_PATTERN.test(value)) {
      throw new BadRequestException(
        `"${value}" no tiene el formato YYYY-MM (ej. 2026-01)`,
      );
    }
    return value;
  }
}
