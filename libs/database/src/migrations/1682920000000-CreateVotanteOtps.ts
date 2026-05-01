import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateVotanteOtps1682920000000 implements MigrationInterface {
  name = 'CreateVotanteOtps1682920000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "votante_otps" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "votante_id" uuid NOT NULL,
      "otp_hash" character varying(255) NOT NULL,
      "expires_at" timestamptz NOT NULL,
      "attempts" integer NOT NULL DEFAULT 0,
      "created_at" timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT "fk_votante" FOREIGN KEY ("votante_id") REFERENCES "votantes"("id") ON DELETE CASCADE
    );`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_votante_otps_votante_id" ON "votante_otps" ("votante_id");`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_votante_otps_votante_id";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "votante_otps";`);
  }
}
