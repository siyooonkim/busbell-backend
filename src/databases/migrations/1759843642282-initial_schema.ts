import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1759843642282 implements MigrationInterface {
    name = 'InitialSchema1759843642282'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notifications" DROP COLUMN "busNumber"`);
        await queryRunner.query(`ALTER TABLE "notifications" DROP COLUMN "stopName"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notifications" ADD "stopName" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "notifications" ADD "busNumber" character varying NOT NULL`);
    }

}
