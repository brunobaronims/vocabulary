import { MigrationInterface, QueryRunner } from 'typeorm';
import * as argon2 from 'argon2';

export class SeedAdminUser1735851000000 implements MigrationInterface {
  name = 'SeedAdminUser1735851000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const passwordHash = await argon2.hash('admin');
    await queryRunner.query(
      'INSERT INTO "user" ("name", "displayName", "password", "role") VALUES ($1, $2, $3, $4) ON CONFLICT ("name") DO NOTHING',
      ['admin', 'Admin', passwordHash, 'ADMIN'],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DELETE FROM "user" WHERE "name" = $1', ['admin']);
  }
}
