import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UserService } from './user.service';
import { UsePipes, ValidationPipe } from '@nestjs/common';
import { CreateUserDto } from './create-user.dto';

@UsePipes(
  new ValidationPipe({
    whitelist: true,
    forbidUnknownValues: true,
  }),
)
@Resolver('User')
export class UserResolver {
  constructor(private userService: UserService) {}

  @Query('user')
  async getUser(@Args('id') id: number) {
    return await this.userService.findOne(id);
  }

  @Mutation('createUser')
  async create(@Args('createUserInput') args: CreateUserDto) {
    return await this.userService.create(args);
  }
}
