import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Session, SessionDifficulty } from './session.entity';
import { SESSION_WORDS, SessionWord } from './session-words';
import { SessionWord as SessionWordEntity } from './session-word.entity';

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
    @InjectRepository(SessionWordEntity)
    private readonly sessionWordRepository: Repository<SessionWordEntity>,
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

  async findLatestByUserId(userId: number): Promise<Session | null> {
    return this.sessionRepository.findOne({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findById(sessionId: number): Promise<Session | null> {
    return this.sessionRepository.findOne({
      where: { id: sessionId },
    });
  }

  async findLatestSessionsByDifficulty(
    userId: number,
  ): Promise<Map<SessionDifficulty, Session>> {
    const sessions = await this.sessionRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
    const latest = new Map<SessionDifficulty, Session>();
    for (const session of sessions) {
      if (!latest.has(session.difficulty)) {
        latest.set(session.difficulty, session);
      }
    }
    return latest;
  }

  getWordsByDifficulty(difficulty: SessionDifficulty): SessionWord[] {
    return SESSION_WORDS.filter((word) => word.difficulty === difficulty);
  }

  async getAnsweredWords(sessionId: number): Promise<string[]> {
    const rows = await this.sessionWordRepository.find({
      where: { sessionId },
      select: { word: true },
    });
    return rows.map((row) => row.word);
  }

  async getSessionScore(sessionId: number): Promise<number> {
    const session = await this.findById(sessionId);
    if (!session) {
      return 0;
    }
    const totalWords = this.getWordsByDifficulty(session.difficulty).length;
    if (totalWords === 0) {
      return 0;
    }
    const correctCount = await this.sessionWordRepository.count({
      where: { sessionId, correct: true },
    });
    return Math.floor((correctCount / totalWords) * 100);
  }

  async getTopWordStats(
    userId: number,
    correct: boolean,
    limit = 3,
  ): Promise<{ term: string; count: number }[]> {
    const rows = await this.sessionWordRepository
      .createQueryBuilder('sw')
      .innerJoin('session', 's', 's.id = sw.session_id')
      .select('sw.word', 'term')
      .addSelect('COUNT(*)', 'count')
      .where('s.user_id = :userId', { userId })
      .andWhere('sw.correct = :correct', { correct })
      .groupBy('sw.word')
      .orderBy('count', 'DESC')
      .limit(limit)
      .getRawMany<{ term: string; count: string }>();

    return rows.map((row) => ({
      term: row.term,
      count: Number(row.count),
    }));
  }

  async recordAnswer(
    sessionId: number,
    word: string,
    correct: boolean,
  ): Promise<void> {
    const entry = this.sessionWordRepository.create({
      sessionId,
      word,
      correct,
      answeredAt: new Date(),
    });
    await this.sessionWordRepository.save(entry);
  }

  async endSession(sessionId: number): Promise<boolean> {
    const result = await this.sessionRepository.update(
      { id: sessionId },
      { endsAt: new Date() },
    );
    return (result.affected ?? 0) > 0;
  }
}
