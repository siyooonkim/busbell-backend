import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1759830450731 implements MigrationInterface {
    name = 'InitialSchema1759830450731'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_bed5ff7f50dae39532b8c99a2b"`);
        await queryRunner.query(`ALTER TABLE "auth" DROP COLUMN "provider"`);
        await queryRunner.query(`ALTER TABLE "auth" DROP COLUMN "phone"`);
        await queryRunner.query(`ALTER TABLE "auth" DROP COLUMN "kakaoId"`);
        await queryRunner.query(`ALTER TABLE "auth" DROP COLUMN "userId"`);
        await queryRunner.query(`ALTER TABLE "auth" ADD "userId" integer NOT NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_e582e8aba97e7b29ef5d6f4de7" ON "auth" ("deviceId", "userId") `);
        await queryRunner.query(`ALTER TABLE "auth" ADD CONSTRAINT "FK_373ead146f110f04dad60848154" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "auth" DROP CONSTRAINT "FK_373ead146f110f04dad60848154"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e582e8aba97e7b29ef5d6f4de7"`);
        await queryRunner.query(`ALTER TABLE "auth" DROP COLUMN "userId"`);
        await queryRunner.query(`ALTER TABLE "auth" ADD "userId" bigint NOT NULL`);
        await queryRunner.query(`ALTER TABLE "auth" ADD "kakaoId" character varying(100) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "auth" ADD "phone" character varying(20) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "auth" ADD "provider" character varying(20) NOT NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_bed5ff7f50dae39532b8c99a2b" ON "auth" ("phone") `);
    }

}
