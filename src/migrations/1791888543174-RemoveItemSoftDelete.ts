import { MigrationInterface, QueryRunner, TableColumn, TableIndex } from "typeorm";

export class RemoveItemSoftDelete1791888543174 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("DELETE FROM `item` WHERE `deletedAt` IS NOT NULL");
        await queryRunner.dropIndex("item", "IDX_item_month");
        await queryRunner.createIndex("item", new TableIndex({
            name: "IDX_item_month",
            columnNames: ["yearMonth", "completed", "isGain", "price"],
        }));
        await queryRunner.dropColumn("item", "deletedAt");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn("item", new TableColumn({
            name: "deletedAt",
            type: "datetime",
            isNullable: true,
        }));
        await queryRunner.dropIndex("item", "IDX_item_month");
        await queryRunner.createIndex("item", new TableIndex({
            name: "IDX_item_month",
            columnNames: ["yearMonth", "deletedAt", "completed", "isGain", "price"],
        }));
    }

}
