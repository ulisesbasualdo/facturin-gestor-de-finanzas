import { Module } from "@nestjs/common";
import { MonthService } from "./month.service.js";
import { MonthController } from "./month.controller.js";

@Module({
    providers: [MonthService],
    controllers: [MonthController],
    exports: [MonthService]
})
export class MonthModule {}
