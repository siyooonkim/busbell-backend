import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1759768686202 implements MigrationInterface {
    name = 'InitialSchema1759768686202'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "auth_otp" ADD "phone" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "auth_otp" DROP COLUMN "phone"`);
    }

}
