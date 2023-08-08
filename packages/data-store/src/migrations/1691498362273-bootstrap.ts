import {MigrationInterface, QueryRunner} from 'typeorm';

export class Bootstrap1691498362273 implements MigrationInterface {
  name = 'Bootstrap1691498362273';

  public async up(queryRunner: QueryRunner): Promise<void> {
    console.log('Running table bootstrap migration');

    try {
      const result = await queryRunner.query(`SELECT * FROM  "network_entity"`);
      console.log('Table already bootstrapped');
      console.log(result);
      return;
    } catch (err) {
      console.error(err);
    }

    console.log('Running table bootstrap migration');

    await queryRunner.query(
      `CREATE TABLE "network_entity" ("id" varchar PRIMARY KEY NOT NULL, "name" varchar NOT NULL, "configs" varchar NOT NULL)`,
    );
    await queryRunner.query(
      `CREATE TABLE "document_type_entity" ("id" text PRIMARY KEY NOT NULL)`,
    );
    await queryRunner.query(
      `CREATE TABLE "document_entity" ("id" text PRIMARY KEY NOT NULL, "networkId" text, "type" text NOT NULL, "correlation" text NOT NULL, "data" blob NOT NULL)`,
    );
    await queryRunner.query(
      `CREATE TABLE "wallet_entity" ("id" varchar PRIMARY KEY NOT NULL, "version" varchar, "networkId" varchar NOT NULL)`,
    );
    await queryRunner.query(
      `CREATE TABLE "document_entity__type_rel_document_type_entity" ("documentEntityId" text NOT NULL, "documentTypeEntityId" text NOT NULL, PRIMARY KEY ("documentEntityId", "documentTypeEntityId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e929f32563f62d753a51bcd8b9" ON "document_entity__type_rel_document_type_entity" ("documentEntityId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_7d377ef9ddb323247aedd63d66" ON "document_entity__type_rel_document_type_entity" ("documentTypeEntityId") `,
    );
    await queryRunner.query(`DROP INDEX "IDX_e929f32563f62d753a51bcd8b9"`);
    await queryRunner.query(`DROP INDEX "IDX_7d377ef9ddb323247aedd63d66"`);
    await queryRunner.query(
      `CREATE TABLE "temporary_document_entity__type_rel_document_type_entity" ("documentEntityId" text NOT NULL, "documentTypeEntityId" text NOT NULL, CONSTRAINT "FK_e929f32563f62d753a51bcd8b9b" FOREIGN KEY ("documentEntityId") REFERENCES "document_entity" ("id") ON DELETE CASCADE ON UPDATE CASCADE, CONSTRAINT "FK_7d377ef9ddb323247aedd63d663" FOREIGN KEY ("documentTypeEntityId") REFERENCES "document_type_entity" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, PRIMARY KEY ("documentEntityId", "documentTypeEntityId"))`,
    );
    await queryRunner.query(
      `INSERT INTO "temporary_document_entity__type_rel_document_type_entity"("documentEntityId", "documentTypeEntityId") SELECT "documentEntityId", "documentTypeEntityId" FROM "document_entity__type_rel_document_type_entity"`,
    );
    await queryRunner.query(
      `DROP TABLE "document_entity__type_rel_document_type_entity"`,
    );
    await queryRunner.query(
      `ALTER TABLE "temporary_document_entity__type_rel_document_type_entity" RENAME TO "document_entity__type_rel_document_type_entity"`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e929f32563f62d753a51bcd8b9" ON "document_entity__type_rel_document_type_entity" ("documentEntityId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_7d377ef9ddb323247aedd63d66" ON "document_entity__type_rel_document_type_entity" ("documentTypeEntityId") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_7d377ef9ddb323247aedd63d66"`);
    await queryRunner.query(`DROP INDEX "IDX_e929f32563f62d753a51bcd8b9"`);
    await queryRunner.query(
      `ALTER TABLE "document_entity__type_rel_document_type_entity" RENAME TO "temporary_document_entity__type_rel_document_type_entity"`,
    );
    await queryRunner.query(
      `CREATE TABLE "document_entity__type_rel_document_type_entity" ("documentEntityId" text NOT NULL, "documentTypeEntityId" text NOT NULL, PRIMARY KEY ("documentEntityId", "documentTypeEntityId"))`,
    );
    await queryRunner.query(
      `INSERT INTO "document_entity__type_rel_document_type_entity"("documentEntityId", "documentTypeEntityId") SELECT "documentEntityId", "documentTypeEntityId" FROM "temporary_document_entity__type_rel_document_type_entity"`,
    );
    await queryRunner.query(
      `DROP TABLE "temporary_document_entity__type_rel_document_type_entity"`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_7d377ef9ddb323247aedd63d66" ON "document_entity__type_rel_document_type_entity" ("documentTypeEntityId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e929f32563f62d753a51bcd8b9" ON "document_entity__type_rel_document_type_entity" ("documentEntityId") `,
    );
    await queryRunner.query(`DROP INDEX "IDX_7d377ef9ddb323247aedd63d66"`);
    await queryRunner.query(`DROP INDEX "IDX_e929f32563f62d753a51bcd8b9"`);
    await queryRunner.query(
      `DROP TABLE "document_entity__type_rel_document_type_entity"`,
    );
    await queryRunner.query(`DROP TABLE "wallet_entity"`);
    await queryRunner.query(`DROP TABLE "document_entity"`);
    await queryRunner.query(`DROP TABLE "document_type_entity"`);
    await queryRunner.query(`DROP TABLE "network_entity"`);
  }
}
