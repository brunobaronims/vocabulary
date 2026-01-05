import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { SessionService } from './session.service';
import { SessionDifficulty } from './session.entity';

const DIFFICULTIES = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;

@Resolver()
export class SessionResolver {
  constructor(private readonly sessionService: SessionService) {}

  @Query('sessionDifficulties')
  sessionDifficulties() {
    return [...DIFFICULTIES];
  }

  @Query('activeSession')
  async activeSession(@Args('userId') userId: number) {
    const session = await this.sessionService.findLatestByUserId(userId);
    if (!session) {
      return null;
    }
    const now = Date.now();
    const remainingMs = session.endsAt.getTime() - now;
    if (remainingMs <= 0) {
      return null;
    }
    const answeredWords = await this.sessionService.getAnsweredWords(session.id);
    const answeredSet = new Set(answeredWords);
    const availableWords = this.sessionService.getWordsByDifficulty(
      session.difficulty,
    );
    const unansweredWords = availableWords
      .filter((word) => !answeredSet.has(word.term))
      .sort((a, b) => a.term.localeCompare(b.term));
    const currentWord = unansweredWords[0] ?? null;
    return {
      id: session.id,
      userId: session.userId,
      createdAt: session.createdAt.toISOString(),
      endsAt: session.endsAt.toISOString(),
      difficulty: session.difficulty,
      remainingSeconds: Math.ceil(remainingMs / 1000),
      currentWord,
    };
  }

  @Query('sessionScore')
  async sessionScore(@Args('sessionId') sessionId: number) {
    return this.sessionService.getSessionScore(sessionId);
  }

  @Query('studentProgress')
  async studentProgress(@Args('userId') userId: number) {
    const latestSessions =
      await this.sessionService.findLatestSessionsByDifficulty(userId);
    const difficultyScores = await Promise.all(
      Array.from(latestSessions.values()).map(async (session) => ({
        difficulty: session.difficulty,
        score: await this.sessionService.getSessionScore(session.id),
      })),
    );
    const topCorrectWords = await this.sessionService.getTopWordStats(
      userId,
      true,
      3,
    );
    const topIncorrectWords = await this.sessionService.getTopWordStats(
      userId,
      false,
      3,
    );

    return {
      difficultyScores,
      topCorrectWords,
      topIncorrectWords,
    };
  }

  @Mutation('createSession')
  async createSession(
    @Args('input')
    input: {
      userId: number;
      durationMinutes: number;
      difficulty: SessionDifficulty;
    },
  ) {
    const session = await this.sessionService.createSession(input);
    return {
      id: session.id,
      userId: session.userId,
      createdAt: session.createdAt.toISOString(),
      endsAt: session.endsAt.toISOString(),
      difficulty: session.difficulty,
    };
  }

  @Mutation('endSession')
  async endSession(@Args('sessionId') sessionId: number) {
    return this.sessionService.endSession(sessionId);
  }

  @Mutation('guessWord')
  async guessWord(
    @Args('sessionId') sessionId: number,
    @Args('guess') guess: string,
  ) {
    const session = await this.sessionService.findById(sessionId);
    if (!session) {
      return { correct: false, term: '' };
    }
    const answeredWords = await this.sessionService.getAnsweredWords(session.id);
    const answeredSet = new Set(answeredWords);
    const availableWords = this.sessionService.getWordsByDifficulty(
      session.difficulty,
    );
    const unansweredWords = availableWords
      .filter((word) => !answeredSet.has(word.term))
      .sort((a, b) => a.term.localeCompare(b.term));
    const currentWord = unansweredWords[0];
    if (!currentWord) {
      return { correct: false, term: '' };
    }
    const normalizedGuess = guess.trim().toLowerCase();
    const normalizedTerm = currentWord.term.trim().toLowerCase();
    const correct = normalizedGuess === normalizedTerm;
    await this.sessionService.recordAnswer(
      session.id,
      currentWord.term,
      correct,
    );
    return { correct, term: currentWord.term };
  }
}
