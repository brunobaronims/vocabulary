import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAdminRole1735850000000 implements MigrationInterface {
  name = 'AddAdminRole1735850000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TYPE "user_role_enum" ADD VALUE IF NOT EXISTS \'ADMIN\'',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TYPE "user_role_enum" RENAME TO "user_role_enum_old"',
    );
    await queryRunner.query(
      "CREATE TYPE \"user_role_enum\" AS ENUM('STUDENT','TEACHER')",
    );
    await queryRunner.query(
      'ALTER TABLE "user" ALTER COLUMN "role" TYPE "user_role_enum" USING "role"::text::"user_role_enum"',
    );
    await queryRunner.query('DROP TYPE "user_role_enum_old"');
  }
}
