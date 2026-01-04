
/*
 * -------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */

export enum Role {
    STUDENT = "STUDENT",
    TEACHER = "TEACHER",
    ADMIN = "ADMIN"
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
    abstract user(id: string): Nullable<User> | Promise<Nullable<User>>;
}

export abstract class IMutation {
    abstract createUser(createUserInput?: Nullable<CreateUserInput>): Nullable<User> | Promise<Nullable<User>>;

    abstract login(loginInput?: Nullable<LoginInput>): Nullable<AuthPayload> | Promise<Nullable<AuthPayload>>;

    abstract refreshToken(): Nullable<AuthPayload> | Promise<Nullable<AuthPayload>>;

    abstract logout(): boolean | Promise<boolean>;
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
