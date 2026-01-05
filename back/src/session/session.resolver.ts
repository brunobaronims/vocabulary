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
}
