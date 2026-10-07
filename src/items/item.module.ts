import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Item } from "./item.entity.js";
import { ItemService } from "./item.service.js";
import { ItemController } from "./item.controller.js";

@Module({
    imports: [TypeOrmModule.forFeature([Item])],
    providers: [ItemService],
    controllers: [ItemController]
})
export class ItemModule {}