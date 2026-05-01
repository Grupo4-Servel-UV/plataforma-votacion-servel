import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateVotos1714600000001 implements MigrationInterface {
  name = 'CreateVotos1714600000001'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "votos" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "votacion_id" uuid NOT NULL,
      "payload" jsonb NOT NULL,
      "created_at" timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT "fk_votos_votacion" FOREIGN KEY ("votacion_id") REFERENCES "votaciones"("id") ON DELETE CASCADE
    );`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_votos_votacion_id" ON "votos" ("votacion_id");`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_votos_votacion_id";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "votos";`);
  }
}
