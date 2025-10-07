import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1759846373052 implements MigrationInterface {
    name = 'InitialSchema1759846373052'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "nickname" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "nickname"`);
    }

}
