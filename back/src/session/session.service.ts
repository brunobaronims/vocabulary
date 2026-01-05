import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Session, SessionDifficulty } from './session.entity';

type CreateSessionInput = {
  userId: number;
  durationMinutes: number;
  difficulty: SessionDifficulty;
};

@Injectable()
export class SessionService {
  constructor(
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
  ) {}

  async createSession(input: CreateSessionInput): Promise<Session> {
    const createdAt = new Date();
    const endsAt = new Date(createdAt.getTime() + input.durationMinutes * 60000);
    const session = this.sessionRepository.create({
      userId: input.userId,
      createdAt,
      endsAt,
      difficulty: input.difficulty,
    });
    return this.sessionRepository.save(session);
  }
}
