import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1759846638685 implements MigrationInterface {
    name = 'InitialSchema1759846638685'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "nickname" SET NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "nickname" DROP NOT NULL`);
    }

}
