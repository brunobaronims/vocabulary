import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'session_word' })
export class SessionWord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'session_id' })
  sessionId: number;

  @Column()
  word: string;

  @Column()
  correct: boolean;

  @Column({ name: 'answered_at', type: 'timestamptz' })
  answeredAt: Date;
}
