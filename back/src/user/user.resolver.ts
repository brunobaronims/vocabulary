import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UserService } from './user.service';
import { UsePipes, ValidationPipe } from '@nestjs/common';
import { CreateUserDto } from './create-user.dto';
import { LoginDto } from './login.dto';
import { AuthService } from './auth.service';

@UsePipes(
  new ValidationPipe({
    whitelist: true,
    forbidUnknownValues: true,
  }),
)
@Resolver('User')
export class UserResolver {
  constructor(
    private userService: UserService,
    private authService: AuthService,
  ) {}

  @Query('user')
  async getUser(@Args('id') id: number) {
    return await this.userService.findOne(id);
  }

  @Mutation('createUser')
  async create(@Args('createUserInput') args: CreateUserDto) {
    return await this.userService.create(args);
  }

  @Mutation()
  async login(@Args('loginInput') args: LoginDto, @Context() ctx: any) {
    const { accessToken, refreshToken } = await this.authService.login(
      args.name,
      args.password,
    );
    ctx.res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: Number(process.env.JWT_REFRESH_TTL ?? 604800) * 1000,
      path: '/',
    });
    return { accessToken };
  }

  @Mutation()
  async refreshToken(@Context() ctx: any) {
    const refreshToken = ctx.req.cookies?.refreshToken;
    const { accessToken, refreshToken: newRefreshToken } =
      await this.authService.refresh(refreshToken);
    ctx.res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: Number(process.env.JWT_REFRESH_TTL ?? 604800) * 1000,
      path: '/',
    });
    return { accessToken };
  }
}
