import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class RenameItemColumnsToEnglish1791365720000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.renameColumn("item", "titulo", "title");
        await queryRunner.renameColumn("item", "precio", "price");
        await queryRunner.renameColumn("item", "completado", "completed");
        await queryRunner.addColumn("item", new TableColumn({
            name: "yearMonth",
            type: "varchar",
            length: "255",
            isNullable: false,
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("item", "yearMonth");
        await queryRunner.renameColumn("item", "completed", "completado");
        await queryRunner.renameColumn("item", "price", "precio");
        await queryRunner.renameColumn("item", "title", "titulo");
    }

}
