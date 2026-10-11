import { Controller, HttpCode, Param, Post } from "@nestjs/common";
import { ParseYearMonthPipe } from "../common/parse-year-month.pipe.js";
import { MonthService } from "./month.service.js";
import { MonthStatus } from "./month-status.js";

@Controller("months")
export class MonthController {
    constructor(private monthService: MonthService){}
    @Post("close-reopened")
    @HttpCode(204)
    closeAllReopened(): Promise<void> {
        return this.monthService.closeAllReopened();
    }
    @Post(":yearMonth/reopen")
    @HttpCode(200)
    async reopen(@Param("yearMonth", ParseYearMonthPipe) yearMonth: string): Promise<{ status: MonthStatus }> {
        return { status: await this.monthService.reopen(yearMonth) };
    }
    @Post(":yearMonth/close")
    @HttpCode(200)
    async close(@Param("yearMonth", ParseYearMonthPipe) yearMonth: string): Promise<{ status: MonthStatus }> {
        return { status: await this.monthService.close(yearMonth) };
    }
}
