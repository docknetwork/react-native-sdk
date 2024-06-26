import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumn,
  TableForeignKey,
  TableIndex,
} from 'typeorm';
import { logger } from '../logger';

export class Bootstrap1691498362273 implements MigrationInterface {
  name = 'Bootstrap1691498362273';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasNetworkEntityTable = await queryRunner.hasTable('network_entity');

    if (hasNetworkEntityTable) {
      logger.debug('Table already bootstrapped');
      return;
    }

    logger.debug('Running table bootstrap migration');

    await queryRunner.createTable(
      new Table({
        name: 'network_entity',
        columns: [
          new TableColumn({name: 'id', type: 'varchar', isPrimary: true}),
          new TableColumn({name: 'name', type: 'varchar'}),
          new TableColumn({name: 'configs', type: 'varchar'}),
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'document_type_entity',
        columns: [new TableColumn({name: 'id', type: 'text', isPrimary: true})],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'document_entity',
        columns: [
          new TableColumn({name: 'id', type: 'text', isPrimary: true}),
          new TableColumn({name: 'networkId', type: 'text', isNullable: true}),
          new TableColumn({name: 'type', type: 'text'}),
          new TableColumn({name: 'correlation', type: 'text'}),
          new TableColumn({name: 'data', type: 'blob'}),
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'wallet_entity',
        columns: [
          new TableColumn({name: 'id', type: 'varchar', isPrimary: true}),
          new TableColumn({name: 'version', type: 'varchar', isNullable: true}),
          new TableColumn({name: 'networkId', type: 'varchar'}),
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'document_entity__type_rel_document_type_entity',
        columns: [
          new TableColumn({
            name: 'documentEntityId',
            type: 'text',
            isPrimary: true,
          }),
          new TableColumn({
            name: 'documentTypeEntityId',
            type: 'text',
            isPrimary: true,
          }),
        ],
        foreignKeys: [
          new TableForeignKey({
            columnNames: ['documentEntityId'],
            referencedColumnNames: ['id'],
            referencedTableName: 'document_entity',
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
          }),
          new TableForeignKey({
            columnNames: ['documentTypeEntityId'],
            referencedColumnNames: ['id'],
            referencedTableName: 'document_type_entity',
            onDelete: 'NO ACTION',
            onUpdate: 'NO ACTION',
          }),
        ],
      }),
    );

    await queryRunner.createIndex(
      'document_entity__type_rel_document_type_entity',
      new TableIndex({
        name: 'IDX_e929f32563f62d753a51bcd8b9',
        columnNames: ['documentEntityId'],
      }),
    );

    await queryRunner.createIndex(
      'document_entity__type_rel_document_type_entity',
      new TableIndex({
        name: 'IDX_7d377ef9ddb323247aedd63d66',
        columnNames: ['documentTypeEntityId'],
      }),
    );

    logger.debug('Table bootstrap migration completed');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    logger.debug('Running table bootstrap migration revert');
    await queryRunner.dropTable(
      'document_entity__type_rel_document_type_entity',
    );
    await queryRunner.dropTable('wallet_entity');
    await queryRunner.dropTable('document_entity');
    await queryRunner.dropTable('document_type_entity');
    await queryRunner.dropTable('network_entity');
    logger.debug('Revert completed');
  }
}
