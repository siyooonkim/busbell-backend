import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1760844159464 implements MigrationInterface {
    name = 'InitialSchema1760844159464'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."notification_logs_status_enum" AS ENUM('sent', 'error')`);
        await queryRunner.query(`CREATE TABLE "notification_logs" ("id" SERIAL NOT NULL, "notification_id" integer NOT NULL, "status" "public"."notification_logs_status_enum" NOT NULL, "error_message" text, "sent_at" TIMESTAMP NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_19c524e644cdeaebfcffc284871" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_22c1abba38dee0c11c83d939b1" ON "notification_logs" ("created_at") `);
        await queryRunner.query(`CREATE INDEX "IDX_c2ebd7cc75091c58fc810a2e31" ON "notification_logs" ("notification_id") `);
        await queryRunner.query(`CREATE TYPE "public"."notifications_notification_type_enum" AS ENUM('time', 'stops')`);
        await queryRunner.query(`CREATE TYPE "public"."notifications_status_enum" AS ENUM('reserved', 'done', 'canceled', 'expired')`);
        await queryRunner.query(`CREATE TABLE "notifications" ("id" SERIAL NOT NULL, "user_id" integer NOT NULL, "route_id" character varying(100) NOT NULL, "bus_number" character varying(20) NOT NULL, "direction" character varying(20), "stop_id" character varying(100) NOT NULL, "stop_name" character varying(200) NOT NULL, "notification_type" "public"."notifications_notification_type_enum" NOT NULL, "minutes_before" integer, "stops_before" integer, "status" "public"."notifications_status_enum" NOT NULL DEFAULT 'reserved', "last_eta_minutes" integer, "next_poll_at" TIMESTAMP, "expires_at" TIMESTAMP NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_6a72c3c0f683f6462415e653c3a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_c080cd510ab4d07e28dd0e063e" ON "notifications" ("status", "expires_at") `);
        await queryRunner.query(`CREATE INDEX "IDX_73efca91504eb513402299908a" ON "notifications" ("status", "next_poll_at") `);
        await queryRunner.query(`CREATE INDEX "IDX_148ee02399918b869f27b9673e" ON "notifications" ("user_id", "status") `);
        await queryRunner.query(`CREATE TABLE "users" ("id" SERIAL NOT NULL, "email" character varying(255) NOT NULL, "password_hash" character varying(255) NOT NULL, "nickname" character varying(50) NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_97672ac88f789774dd47f7c8be" ON "users" ("email") `);
        await queryRunner.query(`CREATE TABLE "auth" ("id" SERIAL NOT NULL, "user_id" integer NOT NULL, "fcm_token" character varying, "device_id" character varying(255) NOT NULL, "refresh_token_hash" character varying(255) NOT NULL, "refresh_expires_at" TIMESTAMP NOT NULL, "last_login_at" TIMESTAMP NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_7e416cf6172bc5aec04244f6459" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_090ac7cb8b8bdfbeebcdc67b7a" ON "auth" ("refresh_token_hash") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_4cfc7410b3d99d0009197e0e3d" ON "auth" ("user_id", "device_id") `);
        await queryRunner.query(`ALTER TABLE "notification_logs" ADD CONSTRAINT "FK_c2ebd7cc75091c58fc810a2e31b" FOREIGN KEY ("notification_id") REFERENCES "notifications"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "notifications" ADD CONSTRAINT "FK_9a8a82462cab47c73d25f49261f" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "auth" ADD CONSTRAINT "FK_9922406dc7d70e20423aeffadf3" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "auth" DROP CONSTRAINT "FK_9922406dc7d70e20423aeffadf3"`);
        await queryRunner.query(`ALTER TABLE "notifications" DROP CONSTRAINT "FK_9a8a82462cab47c73d25f49261f"`);
        await queryRunner.query(`ALTER TABLE "notification_logs" DROP CONSTRAINT "FK_c2ebd7cc75091c58fc810a2e31b"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_4cfc7410b3d99d0009197e0e3d"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_090ac7cb8b8bdfbeebcdc67b7a"`);
        await queryRunner.query(`DROP TABLE "auth"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_97672ac88f789774dd47f7c8be"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_148ee02399918b869f27b9673e"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_73efca91504eb513402299908a"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c080cd510ab4d07e28dd0e063e"`);
        await queryRunner.query(`DROP TABLE "notifications"`);
        await queryRunner.query(`DROP TYPE "public"."notifications_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."notifications_notification_type_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c2ebd7cc75091c58fc810a2e31"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_22c1abba38dee0c11c83d939b1"`);
        await queryRunner.query(`DROP TABLE "notification_logs"`);
        await queryRunner.query(`DROP TYPE "public"."notification_logs_status_enum"`);
    }

}
