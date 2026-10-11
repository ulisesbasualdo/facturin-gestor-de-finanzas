import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeItemPriceToDecimal1791747324268 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `item` MODIFY `price` DECIMAL(12, 2) NOT NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `item` MODIFY `price` INT NOT NULL");
    }

}
