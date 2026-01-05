import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum SessionDifficulty {
  A1 = 'A1',
  A2 = 'A2',
  B1 = 'B1',
  B2 = 'B2',
  C1 = 'C1',
  C2 = 'C2',
}

@Entity()
export class Session {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @Column({
    type: 'enum',
    enum: SessionDifficulty,
  })
  difficulty: SessionDifficulty;

  @Column({ name: 'ends_at', type: 'timestamptz' })
  endsAt: Date;
}
