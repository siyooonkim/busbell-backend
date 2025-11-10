import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1762787275358 implements MigrationInterface {
    name = 'InitialSchema1762787275358'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_4cfc7410b3d99d0009197e0e3d"`);
        await queryRunner.query(`ALTER TABLE "auth" DROP COLUMN "device_id"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_9922406dc7d70e20423aeffadf" ON "auth" ("user_id") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_9922406dc7d70e20423aeffadf"`);
        await queryRunner.query(`ALTER TABLE "auth" ADD "device_id" character varying(255) NOT NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_4cfc7410b3d99d0009197e0e3d" ON "auth" ("user_id", "device_id") `);
    }

}
