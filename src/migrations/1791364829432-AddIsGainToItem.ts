import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddIsGainToItem1791364829432 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn("item", new TableColumn({
            name: "isGain",
            type: "boolean",
            default: false,
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("item", "isGain");
    }

}
