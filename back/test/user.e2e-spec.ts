import { existsSync } from 'fs';
import { resolve } from 'path';
import { config } from 'dotenv';
import { faker } from '@faker-js/faker';

const envPath = resolve(process.cwd(), '.env');
if (existsSync(envPath)) {
  config({ path: envPath });
}

import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';
import { User } from '../src/user/user.entity';

describe('User', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  jest.setTimeout(5000);

  const mutation = `
    mutation CreateUser($input: CreateUserInput!) {
      createUser(createUserInput: $input) {
        id
        name
        displayName
        role
      }
    }
  `;

  const createUser = (input: {
    name: string;
    displayName?: string;
    password: string;
    role: 'STUDENT' | 'TEACHER';
  }) =>
    request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: mutation,
        variables: { input },
      })
      .expect(200);

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    dataSource = app.get(DataSource);
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  const name = faker.person.firstName();
  const username = faker.internet.username({ firstName: name });
  const displayName = faker.internet.displayName({ firstName: name });
  const weakPassword = faker.internet.password({ length: 5 });
  const strongPassword = faker.internet.password({
    length: 12,
    memorable: false,
    pattern: /[A-Za-z0-9]/,
    prefix: 'Aa1!',
  });

  it('rejects weak passwords', async () => {
    const response = await createUser({
      name: username,
      displayName,
      password: weakPassword,
      role: 'STUDENT',
    });

    const message = response.body?.errors?.[0]?.message ?? '';
    expect(message).toContain('Password');
  });

  it('rejects non-alphanumeric names', async () => {
    const response = await createUser({
      name: `${username}_`,
      displayName,
      password: strongPassword,
      role: 'STUDENT',
    });

    const message = response.body?.errors?.[0]?.message ?? '';
    expect(message).toContain('Name must contain only letters or numbers');
  });

  it('rejects empty display names', async () => {
    const response = await createUser({
      name: username,
      displayName: '',
      password: strongPassword,
      role: 'STUDENT',
    });

    const message = response.body?.errors?.[0]?.message ?? '';
    expect(message).toContain('Display name cannot be empty');
  });

  it('creates a user and fetches it from the database', async () => {
    const response = await createUser({
      name: username,
      displayName,
      password: strongPassword,
      role: 'STUDENT',
    });

    if (response.body?.errors?.length) {
      throw new Error(JSON.stringify(response.body.errors));
    }

    const created = response.body?.data?.createUser;
    expect(created).toBeTruthy();
    expect(created.name).toBe(username);
    expect(created.displayName).toBe(displayName);
    expect(created.role).toBe('STUDENT');

    const userRepo = dataSource.getRepository(User);
    const dbUser = await userRepo.findOne({ where: { name: username } });

    expect(dbUser).toBeTruthy();
    expect(dbUser?.name).toBe(username);
    expect(dbUser?.displayName).toBe(displayName);
    expect(dbUser?.role).toBe('STUDENT');
    expect(dbUser?.password).toBeTruthy();
    expect(dbUser?.password).not.toBe(strongPassword);
  });

  it('rejects duplicate usernames', async () => {
    const response = await createUser({
      name: username,
      displayName,
      password: strongPassword,
      role: 'STUDENT',
    });

    const message = response.body?.errors?.[0]?.message ?? '';
    expect(message).toContain('User name already exists');

    const userRepo = dataSource.getRepository(User);
    await userRepo.delete({ name: username });
  });
});
