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

  @Column({ unique: true })
  name: string;

  @Column({ name: 'display_name' })
  displayName: string;

  @Column()
  password: string;

  @Column({ type: 'enum', enum: Role })
  role: Role;
}
