import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Item } from "./item.entity.js";
import { ItemService } from "./item.service.js";
import { ItemController } from "./item.controller.js";
import { MonthModule } from "../months/month.module.js";

@Module({
    imports: [TypeOrmModule.forFeature([Item]), MonthModule],
    providers: [ItemService],
    controllers: [ItemController]
})
export class ItemModule {}
