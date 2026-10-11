import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";

export class AddMonthCloseAndItemIndex1791750393016 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
            name: "month_close",
            columns: [
                { name: "yearMonth", type: "varchar", length: "7", isPrimary: true },
                { name: "net", type: "decimal", precision: 12, scale: 2, isNullable: false },
                { name: "closedAt", type: "datetime", isNullable: true },
                { name: "reopenedAt", type: "datetime", isNullable: true },
            ],
        }));
        await queryRunner.createIndex("item", new TableIndex({
            name: "IDX_item_month",
            columnNames: ["yearMonth", "completed", "isGain", "price"],
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropIndex("item", "IDX_item_month");
        await queryRunner.dropTable("month_close");
    }

}
