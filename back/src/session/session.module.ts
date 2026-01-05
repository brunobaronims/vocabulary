import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SessionResolver } from './session.resolver';
import { SessionService } from './session.service';
import { Session } from './session.entity';
import { SessionWord } from './session-word.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Session, SessionWord])],
  providers: [SessionResolver, SessionService],
})
export class SessionModule {}
