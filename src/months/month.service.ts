import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { currentYearMonth } from '../common/year-month.js';
import { MonthClose } from './month-close.entity.js';
import { MonthStatus } from './month-status.js';

/** Recalcula el neto de los meses reabiertos que cumplan la condición extra y los marca como cerrados. */
const CLOSE_REOPENED_SQL = `
  UPDATE month_close m
  SET
    m.net = (
      SELECT COALESCE(SUM(CASE WHEN i.isGain THEN i.price ELSE -i.price END), 0)
      FROM item i
      WHERE i.yearMonth = m.yearMonth AND i.completed
    ),
    m.closedAt = NOW(),
    m.reopenedAt = NULL
  WHERE m.reopenedAt IS NOT NULL`;

@Injectable()
export class MonthService {
  constructor(private readonly dataSource: DataSource) {}

  /** Devuelve el estado del mes. */
  async getStatus(yearMonth: string): Promise<MonthStatus> {
    if (yearMonth >= currentYearMonth()) {
      return 'open';
    }
    const row = await this.dataSource.manager.findOneBy(MonthClose, { yearMonth });
    return row?.reopenedAt ? 'reopened' : 'closed';
  }

  /** Lanza 409 si el mes está cerrado; si está reabierto, bloquea su fila hasta el fin de la transacción. */
  async assertWritable(manager: EntityManager, yearMonth: string): Promise<void> {
    if (yearMonth >= currentYearMonth()) {
      return;
    }
    const row = await manager.findOne(MonthClose, {
      where: { yearMonth },
      lock: { mode: 'pessimistic_write' },
    });
    if (!row?.reopenedAt) {
      throw new ConflictException(
        `El mes ${yearMonth} está cerrado. Reabrilo para modificarlo.`,
      );
    }
  }

  /** Guarda el neto de los meses pasados que todavía no lo tienen guardado. */
  async cacheClosedMonths(): Promise<void> {
    await this.dataSource.query(
      `
      INSERT INTO month_close (yearMonth, net, closedAt)
      SELECT
        i.yearMonth,
        COALESCE(SUM(CASE WHEN i.completed THEN (CASE WHEN i.isGain THEN i.price ELSE -i.price END) END), 0),
        NOW()
      FROM item i
      LEFT JOIN month_close m ON m.yearMonth = i.yearMonth
      WHERE m.yearMonth IS NULL AND i.yearMonth < ?
      GROUP BY i.yearMonth
      ON DUPLICATE KEY UPDATE month_close.yearMonth = month_close.yearMonth`,
      [currentYearMonth()],
    );
  }

  /** Reabre un mes pasado para poder modificarlo. */
  async reopen(yearMonth: string): Promise<MonthStatus> {
    this.assertPast(yearMonth);
    await this.dataSource.query(
      `
      INSERT INTO month_close (yearMonth, net, reopenedAt)
      VALUES (?, 0, NOW())
      ON DUPLICATE KEY UPDATE reopenedAt = NOW()`,
      [yearMonth],
    );
    return 'reopened';
  }

  /** Vuelve a cerrar un mes reabierto, recalculando su neto. */
  async close(yearMonth: string): Promise<MonthStatus> {
    this.assertPast(yearMonth);
    await this.dataSource.query(`${CLOSE_REOPENED_SQL} AND m.yearMonth = ?`, [
      yearMonth,
    ]);
    return 'closed';
  }

  /** Vuelve a cerrar todos los meses reabiertos. */
  async closeAllReopened(): Promise<void> {
    await this.dataSource.query(CLOSE_REOPENED_SQL);
  }

  /** Lanza 400 si el mes no es pasado. */
  private assertPast(yearMonth: string): void {
    if (yearMonth >= currentYearMonth()) {
      throw new BadRequestException(
        `El mes ${yearMonth} no es pasado: solo se pueden cerrar o reabrir meses pasados.`,
      );
    }
  }
}
