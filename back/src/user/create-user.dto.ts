import {
  IsAlphanumeric,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsStrongPassword,
  Length,
  MaxLength,
} from 'class-validator';
import { CreateUserInput, Role } from 'src/graphql';

const PASSWORD_LENGTH_ERROR = 'Password must be 6 to 128 characters long';
const PASSWORD_COMPLEXITY_ERROR =
  'Password must include at least one lowercase letter, one uppercase letter, one number, and one special character';
const PASSWORD_REQUIRED_ERROR = 'Password is required';
const NAME_LENGTH_ERROR = 'Name must be 1 to 128 characters long';
const NAME_ALPHANUMERIC_ERROR = 'Name must contain only letters or numbers';
const NAME_REQUIRED_ERROR = 'Name is required';
const DISPLAY_NAME_EMPTY_ERROR = 'Display name cannot be empty';
const ROLE_REQUIRED_ERROR = 'User role is required';
const ROLE_ENUM_ERROR = 'User role must be STUDENT or TEACHER';

export class CreateUserDto extends CreateUserInput {
  @Length(1, 128, { message: NAME_LENGTH_ERROR })
  @IsAlphanumeric(undefined, { message: NAME_ALPHANUMERIC_ERROR })
  @IsNotEmpty({ message: NAME_REQUIRED_ERROR })
  declare name: string;

  @IsOptional()
  @IsNotEmpty({ message: DISPLAY_NAME_EMPTY_ERROR })
  declare displayName?: string | null;

  @IsNotEmpty({ message: ROLE_REQUIRED_ERROR })
  @IsEnum(Role, { message: ROLE_ENUM_ERROR })
  declare role: Role;

  @MaxLength(128, { message: PASSWORD_LENGTH_ERROR })
  @IsStrongPassword(
    {
      minLength: 6,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    },
    { message: PASSWORD_COMPLEXITY_ERROR },
  )
  @IsNotEmpty({ message: PASSWORD_REQUIRED_ERROR })
  declare password: string;
}
