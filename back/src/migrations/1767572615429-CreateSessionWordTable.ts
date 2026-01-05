import {
    MigrationInterface,
    QueryRunner,
    Table,
    TableForeignKey,
    TableIndex,
} from "typeorm";

export class CreateSessionWordTable1767572615429 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'session_word',
                columns: [
                    {
                        name: 'id',
                        type: 'int',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'increment',
                    },
                    {
                        name: 'session_id',
                        type: 'int',
                        isNullable: false,
                    },
                    {
                        name: 'word',
                        type: 'varchar',
                        isNullable: false,
                    },
                    {
                        name: 'correct',
                        type: 'boolean',
                        isNullable: false,
                    },
                    {
                        name: 'answered_at',
                        type: 'timestamptz',
                        default: 'now()',
                    },
                ],
            }),
        );

        await queryRunner.createForeignKey(
            'session_word',
            new TableForeignKey({
                name: 'FK_session_word_session',
                columnNames: ['session_id'],
                referencedTableName: 'session',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            }),
        );

        await queryRunner.createIndex(
            'session_word',
            new TableIndex({
                name: 'IDX_session_word_session_correct',
                columnNames: ['session_id', 'correct'],
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropIndex('session_word', 'IDX_session_word_session_correct');
        await queryRunner.dropForeignKey('session_word', 'FK_session_word_session');
        await queryRunner.dropTable('session_word');
    }

}
