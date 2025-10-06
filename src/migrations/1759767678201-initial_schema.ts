import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1759767678201 implements MigrationInterface {
    name = 'InitialSchema1759767678201'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "auth" ("id" SERIAL NOT NULL, "userId" bigint NOT NULL, "provider" character varying(20) NOT NULL, "phone" character varying(20) NOT NULL, "kakaoId" character varying(100) NOT NULL, "deviceId" character varying(191) NOT NULL, "refreshTokenHash" character varying, "refreshExpiresAt" TIMESTAMP WITH TIME ZONE, "lastLoginAt" TIMESTAMP WITH TIME ZONE, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_7e416cf6172bc5aec04244f6459" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_bed5ff7f50dae39532b8c99a2b" ON "auth" ("phone") `);
        await queryRunner.query(`CREATE TABLE "auth_otp" ("id" SERIAL NOT NULL, "authId" integer NOT NULL, "code" character varying NOT NULL, "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL, "attempts" integer NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_06c70acc09e7cb64b282d37e139" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "users" ADD "nickname" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "auth_otp" ADD CONSTRAINT "FK_301ea5bc656298c41d7a2311b69" FOREIGN KEY ("authId") REFERENCES "auth"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "auth_otp" DROP CONSTRAINT "FK_301ea5bc656298c41d7a2311b69"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "nickname"`);
        await queryRunner.query(`DROP TABLE "auth_otp"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_bed5ff7f50dae39532b8c99a2b"`);
        await queryRunner.query(`DROP TABLE "auth"`);
    }

}
