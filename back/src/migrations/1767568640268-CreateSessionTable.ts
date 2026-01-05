import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateSessionTable1767568640268 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'session',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'user_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamptz',
            default: 'now()',
          },
          {
            name: 'difficulty',
            type: 'enum',
            enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
            isNullable: false,
          },
          {
            name: 'ends_at',
            type: 'timestamptz',
            isNullable: false,
          },
        ],
      }),
    );

    await queryRunner.createForeignKey(
      'session',
      new TableForeignKey({
        name: 'FK_session_user',
        columnNames: ['user_id'],
        referencedTableName: 'user',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );

    await queryRunner.query(
      'CREATE INDEX "IDX_session_user_created_at" ON "session" ("user_id", "created_at" DESC)',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX "IDX_session_user_created_at"');
    await queryRunner.dropForeignKey('session', 'FK_session_user');
    await queryRunner.dropTable('session');
  }
}
