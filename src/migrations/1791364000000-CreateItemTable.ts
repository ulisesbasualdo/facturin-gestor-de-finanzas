import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateItemTable1791364000000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
            name: "item",
            columns: [
                { name: "id", type: "int", isPrimary: true, isGenerated: true, generationStrategy: "increment" },
                { name: "titulo", type: "varchar", length: "255", isNullable: false },
                { name: "precio", type: "int", isNullable: false },
                { name: "completado", type: "boolean", isNullable: false },
            ],
        }), true);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("item");
    }

}
