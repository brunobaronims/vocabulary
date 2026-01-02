import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { DataSource } from 'typeorm';
import { CreateUserDto } from './create-user.dto';
import * as argon2 from 'argon2';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private dataSource: DataSource,
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    const existingUser = await this.usersRepository.findOne({
      where: { name: dto.name },
    });
    if (existingUser) {
      throw new ConflictException('User name already exists.');
    }
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    const passwordHash = await argon2.hash(dto.password);
    const user = queryRunner.manager.create(User, {
      name: dto.name,
      displayName: dto.displayName || dto.name,
      password: passwordHash,
      role: dto.role,
    });

    try {
      const savedUser = await queryRunner.manager.save(user);

      await queryRunner.commitTransaction();
      return savedUser;
    } catch (err) {
      await queryRunner.rollbackTransaction();

      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async findOne(id: number): Promise<User | null> {
    return this.usersRepository.findOneBy({ id });
  }
}
