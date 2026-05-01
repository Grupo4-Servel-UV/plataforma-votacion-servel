import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateParticipaciones1714600000000 implements MigrationInterface {
  name = 'CreateParticipaciones1714600000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "participaciones" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "votacion_id" uuid NOT NULL,
      "votante_hash" character varying(255) NOT NULL,
      "created_at" timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT "fk_participaciones_votacion" FOREIGN KEY ("votacion_id") REFERENCES "votaciones"("id") ON DELETE CASCADE
    );`);
    await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS "idx_participaciones_unique_votacion_votante" ON "participaciones" ("votacion_id", "votante_hash");`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_participaciones_votacion_id" ON "participaciones" ("votacion_id");`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_participaciones_votacion_id";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_participaciones_unique_votacion_votante";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "participaciones";`);
  }
}
