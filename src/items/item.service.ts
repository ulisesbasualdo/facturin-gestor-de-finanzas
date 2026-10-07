import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Item } from './item.entity.js';
import { CreateItemDto } from './dto/create-item.dto.js';
import { UpdateItemDto } from './dto/update-item.dto.js';
import { LessThan, Repository } from 'typeorm';
import { MonthlySummary } from './interfaces/monthly-summary.interface.js';

@Injectable()
export class ItemService {
  constructor(
    @InjectRepository(Item) private readonly itemRepository: Repository<Item>,
  ) {}
  findAll(): Promise<Item[]> {
    return this.itemRepository.find();
  }
  findByYearAndMonth(yearMonth: string): Promise<Item[]> {
    return this.itemRepository.find({ where: { yearMonth } });
  }
  save(item: CreateItemDto): Promise<Item> {
    return this.itemRepository.save(item);
  }
  async update(id: number, changes: UpdateItemDto): Promise<Item> {
    const item = await this.itemRepository.findOneBy({ id });
    if (!item) {
      throw new NotFoundException(`Item ${id} no existe`);
    }
    return this.itemRepository.save({ ...item, ...changes, id });
  }
  async delete(id: number): Promise<void> {
    const result = await this.itemRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Item ${id} no existe`);
    }
  }
  async duplicate(id: number): Promise<Item> {
    const item = await this.itemRepository.findOneBy({ id });
    if (!item) {
      throw new NotFoundException(`Item ${id} no existe`);
    }
    const { id: _omit, ...rest } = item;
    return this.itemRepository.save(rest);
  }
  async getMonthlySummary(yearMonth: string): Promise<MonthlySummary> {
    const monthItems = await this.itemRepository.find({ where: { yearMonth } });

    const gained = this.sumWhere(monthItems, (i) => i.isGain && i.completed);
    const spent = this.sumWhere(monthItems, (i) => !i.isGain && i.completed);
    const pendingExpenses = this.sumWhere(
      monthItems,
      (i) => !i.isGain && !i.completed,
    );

    const remaining = gained - spent;
    const projectedMonthEnd = remaining - pendingExpenses;

    const previousItems = await this.itemRepository.find({
      where: { yearMonth: LessThan(yearMonth), completed: true },
    });
    const accumulatedBeforeThisMonth = previousItems.reduce(
      (total, i) => total + (i.isGain ? i.price : -i.price),
      0,
    );

    const totalProjectedSavings =
      accumulatedBeforeThisMonth + projectedMonthEnd;

    return {
      gained,
      spent,
      pendingExpenses,
      remaining,
      projectedMonthEnd,
      accumulatedBeforeThisMonth,
      totalProjectedSavings,
      trend: projectedMonthEnd >= 0 ? 'increase' : 'decrease',
    };
  }

  private sumWhere(
    items: Item[],
    predicate: (item: Item) => boolean,
  ): number {
    return items.filter(predicate).reduce((total, i) => total + i.price, 0);
  }
}
