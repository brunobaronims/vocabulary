import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameUserColumnsToSnakeCase1767574000000
  implements MigrationInterface
{
  name = 'RenameUserColumnsToSnakeCase1767574000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "user" RENAME COLUMN "displayName" TO "display_name"',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "user" RENAME COLUMN "display_name" TO "displayName"',
    );
  }
}
