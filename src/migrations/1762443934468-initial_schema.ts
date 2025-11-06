import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1762443934468 implements MigrationInterface {
    name = 'InitialSchema1762443934468'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notifications" ADD "city_code" integer NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notifications" DROP COLUMN "city_code"`);
    }

}
