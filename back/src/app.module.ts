import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { UserModule } from './user/user.module';
import { DataSource } from 'typeorm';
import { join } from 'path';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: Number(process.env.POSTGRES_PORT),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      autoLoadEntities: true,
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      typePaths: ['./**/*.graphql'],
      definitions: {
        path: join(process.cwd(), 'src/graphql.ts'),
        outputAs: 'class',
      },
      formatError: (error) => {
        const originalMessage =
          (error.extensions?.originalError as { message?: unknown })?.message;
        const message = Array.isArray(originalMessage)
          ? originalMessage.join('; ')
          : error.message;
        return {
          message,
          locations: error.locations,
          path: error.path,
        };
      },
    }),
    UserModule,
  ],
})
export class AppModule {
    constructor(private dataSource: DataSource) {}
}
