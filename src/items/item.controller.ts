import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from "@nestjs/common";
import { ItemService } from "./item.service.js";
import { Item } from "./item.entity.js";
import { CreateItemDto } from "./dto/create-item.dto.js";
import { UpdateItemDto } from "./dto/update-item.dto.js";
import { MonthlySummary } from "./interfaces/monthly-summary.interface.js";
import { ParseYearMonthPipe } from "../common/parse-year-month.pipe.js";

@Controller("items")
export class ItemController {
    constructor(private itemService: ItemService){}
    @Get()
    findAll(): Promise<Item[]> {
        return this.itemService.findAll();
    }
    @Get(":yearMonth")
    findByYearAndMonth(@Param("yearMonth", ParseYearMonthPipe) yearMonth: string): Promise<Item[]> {
        return this.itemService.findByYearAndMonth(yearMonth);
    }
    @Get(":yearMonth/summary")
    getMonthlySummary(@Param("yearMonth", ParseYearMonthPipe) yearMonth: string): Promise<MonthlySummary> {
        return this.itemService.getMonthlySummary(yearMonth);
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