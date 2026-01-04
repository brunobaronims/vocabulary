import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

enum Role {
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER',
  ADMIN = 'ADMIN',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  displayName: string;

  @Column()
  password: string;

  @Column()
  role: Role;
}
