import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from "@nestjs/common";
import { ItemService } from "./item.service.js";
import { Item } from "./item.entity.js";
import { CreateItemDto } from "./dto/create-item.dto.js";
import { UpdateItemDto } from "./dto/update-item.dto.js";

@Controller("items")
export class ItemController {
    constructor(private itemService: ItemService){}
    @Get()
    findAll(): Promise<Item[]> {
        return this.itemService.findAll();
    }
    @Get(":yearMonth")
    findByYearAndMonth(@Param("yearMonth") yearMonth: string): Promise<Item[]> {
        return this.itemService.findByYearAndMonth(yearMonth);
    }
    @Post()
    save(@Body() item: CreateItemDto): Promise<Item> {
        return this.itemService.save(item);
    }
    @Patch(":id")
    update(@Param("id", ParseIntPipe) id: number, @Body() item: UpdateItemDto): Promise<Item> {
        return this.itemService.update(id, item);
    }
    @Delete(":id")
    delete(@Param("id", ParseIntPipe) id: number): Promise<void> {
        return this.itemService.delete(id);
    }
    @Post(":id/duplicate")
    duplicate(@Param("id", ParseIntPipe) id: number): Promise<Item> {
        return this.itemService.duplicate(id);
    }
}