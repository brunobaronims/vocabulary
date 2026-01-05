
/*
 * -------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */

export enum Difficulty {
    A1 = "A1",
    A2 = "A2",
    B1 = "B1",
    B2 = "B2",
    C1 = "C1",
    C2 = "C2"
}

export enum Role {
    STUDENT = "STUDENT",
    TEACHER = "TEACHER",
    ADMIN = "ADMIN"
}

export class CreateSessionInput {
    userId: number;
    durationMinutes: number;
    difficulty: Difficulty;
}

export class CreateUserInput {
    name: string;
    displayName?: Nullable<string>;
    password: string;
    role: Role;
}

export class LoginInput {
    name: string;
    password: string;
}

export abstract class IQuery {
    abstract sessionDifficulties(): Difficulty[] | Promise<Difficulty[]>;

    abstract user(id: string): Nullable<User> | Promise<Nullable<User>>;
}

export abstract class IMutation {
    abstract createSession(input: CreateSessionInput): Session | Promise<Session>;

    abstract createUser(createUserInput?: Nullable<CreateUserInput>): Nullable<User> | Promise<Nullable<User>>;

    abstract login(loginInput?: Nullable<LoginInput>): Nullable<AuthPayload> | Promise<Nullable<AuthPayload>>;

    abstract refreshToken(): Nullable<AuthPayload> | Promise<Nullable<AuthPayload>>;

    abstract logout(): boolean | Promise<boolean>;
}

export class Session {
    id: number;
    userId: number;
    createdAt: string;
    endsAt: string;
    difficulty: Difficulty;
}

export class User {
    id: number;
    name: string;
    displayName: string;
    role: Role;
}

export class AuthPayload {
    accessToken: string;
}

type Nullable<T> = T | null;
