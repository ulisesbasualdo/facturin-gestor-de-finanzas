import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Item } from './item.entity.js';
import { CreateItemDto } from './dto/create-item.dto.js';
import { UpdateItemDto } from './dto/update-item.dto.js';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { MonthlySummary } from './interfaces/monthly-summary.interface.js';
import { MonthService } from '../months/month.service.js';
import { currentYearMonth } from '../common/year-month.js';

/** Montos del resumen, calculados por MySQL. */
type SummaryAmounts = Omit<MonthlySummary, 'trend' | 'monthStatus'>;

/**
 * Calcula todos los montos del resumen de un mes.
 * Parámetros: mes, mes, mes, mes actual.
 */
const SUMMARY_SQL = `
  SELECT
    t.gained,
    t.spent,
    t.pendingIncome,
    t.pendingExpenses,
    t.gained + t.pendingIncome AS totalIncome,
    t.spent + t.pendingExpenses AS totalExpenses,
    t.gained - t.spent AS remaining,
    t.gained - t.spent - t.pendingExpenses AS projectedMonthEnd,
    t.gained - t.spent - t.pendingExpenses + t.pendingIncome AS projectedWithPendingIncome,
    a.accumulated AS accumulatedBeforeThisMonth,
    a.accumulated + t.gained - t.spent - t.pendingExpenses AS totalProjectedSavings,
    a.accumulated + t.gained - t.spent - t.pendingExpenses + t.pendingIncome AS totalProjectedSavingsWithPendingIncome
  FROM (
    SELECT
      COALESCE(SUM(CASE WHEN isGain AND completed THEN price END), 0) AS gained,
      COALESCE(SUM(CASE WHEN NOT isGain AND completed THEN price END), 0) AS spent,
      COALESCE(SUM(CASE WHEN isGain AND NOT completed THEN price END), 0) AS pendingIncome,
      COALESCE(SUM(CASE WHEN NOT isGain AND NOT completed THEN price END), 0) AS pendingExpenses
    FROM item
    WHERE yearMonth = ? AND deletedAt IS NULL
  ) t
  CROSS JOIN (
    SELECT
      (
        SELECT COALESCE(SUM(net), 0)
        FROM month_close
        WHERE yearMonth < ? AND reopenedAt IS NULL
      ) + (
        SELECT COALESCE(SUM(CASE WHEN isGain THEN price ELSE -price END), 0)
        FROM item
        WHERE yearMonth < ? AND completed AND deletedAt IS NULL
          AND (
            yearMonth >= ?
            OR yearMonth IN (SELECT yearMonth FROM month_close WHERE reopenedAt IS NOT NULL)
          )
      ) AS accumulated
  ) a`;

@Injectable()
export class ItemService {
  constructor(
    @InjectRepository(Item) private readonly itemRepository: Repository<Item>,
    private readonly dataSource: DataSource,
    private readonly monthService: MonthService,
  ) {}
  findAll(): Promise<Item[]> {
    return this.itemRepository.find();
  }
  findByYearAndMonth(yearMonth: string): Promise<Item[]> {
    return this.itemRepository.find({ where: { yearMonth } });
  }
  save(item: CreateItemDto): Promise<Item> {
    return this.dataSource.transaction(async (manager) => {
      await this.monthService.assertWritable(manager, item.yearMonth);
      return manager.save(Item, item);
    });
  }
  update(id: number, changes: UpdateItemDto): Promise<Item> {
    return this.dataSource.transaction(async (manager) => {
      const item = await this.findOrFail(manager, id);
      const months = new Set([item.yearMonth, changes.yearMonth ?? item.yearMonth]);
      for (const yearMonth of [...months].sort()) {
        await this.monthService.assertWritable(manager, yearMonth);
      }
      return manager.save(manager.merge<Item>(Item, item, changes));
    });
  }
  delete(id: number): Promise<void> {
    return this.dataSource.transaction(async (manager) => {
      const item = await this.findOrFail(manager, id);
      await this.monthService.assertWritable(manager, item.yearMonth);
      await manager.softDelete(Item, id);
    });
  }
  restore(id: number): Promise<Item> {
    return this.dataSource.transaction(async (manager) => {
      const item = await manager.findOne(Item, { where: { id }, withDeleted: true });
      if (!item) {
        throw new NotFoundException(`Item ${id} no existe`);
      }
      await this.monthService.assertWritable(manager, item.yearMonth);
      await manager.restore(Item, id);
      return item;
    });
  }
  duplicate(id: number): Promise<Item> {
    return this.dataSource.transaction(async (manager) => {
      const item = await this.findOrFail(manager, id);
      await this.monthService.assertWritable(manager, item.yearMonth);
      const { id: _omit, ...rest } = item;
      return manager.save(Item, rest);
    });
  }
  async getMonthlySummary(yearMonth: string): Promise<MonthlySummary> {
    await this.monthService.cacheClosedMonths();
    const [row]: Record<keyof SummaryAmounts, string>[] = await this.dataSource.query(
      SUMMARY_SQL,
      [yearMonth, yearMonth, yearMonth, currentYearMonth()],
    );
    const amounts = Object.fromEntries(
      Object.entries(row).map(([key, value]) => [key, Number(value)]),
    ) as SummaryAmounts;
    return {
      ...amounts,
      trend: amounts.projectedMonthEnd >= 0 ? 'increase' : 'decrease',
      monthStatus: await this.monthService.getStatus(yearMonth),
    };
  }

  private async findOrFail(manager: EntityManager, id: number): Promise<Item> {
    const item = await manager.findOneBy(Item, { id });
    if (!item) {
      throw new NotFoundException(`Item ${id} no existe`);
    }
    return item;
  }
}
