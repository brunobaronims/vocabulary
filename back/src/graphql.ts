
/*
 * -------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */

export enum Role {
    STUDENT = "STUDENT",
    TEACHER = "TEACHER"
}

export class CreateUserInput {
    name: string;
    displayName?: Nullable<string>;
    password: string;
    role: Role;
}

export abstract class IQuery {
    abstract user(id: string): Nullable<User> | Promise<Nullable<User>>;
}

export abstract class IMutation {
    abstract createUser(createUserInput?: Nullable<CreateUserInput>): Nullable<User> | Promise<Nullable<User>>;
}

export class User {
    id: number;
    name: string;
    displayName: string;
    role: Role;
}

type Nullable<T> = T | null;
