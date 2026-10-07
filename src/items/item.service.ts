import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Item } from './item.entity.js';
import { CreateItemDto } from './dto/create-item.dto.js';
import { UpdateItemDto } from './dto/update-item.dto.js';
import { Repository } from 'typeorm';

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
}
