import {
  IsNotEmpty,
} from 'class-validator';
import { LoginInput } from '../graphql';

const PASSWORD_REQUIRED_ERROR = 'Password is required';
const NAME_REQUIRED_ERROR = 'Name is required';

export class LoginDto extends LoginInput {
  @IsNotEmpty({ message: NAME_REQUIRED_ERROR })
  declare name: string;

  @IsNotEmpty({ message: PASSWORD_REQUIRED_ERROR })
  declare password: string;
}
