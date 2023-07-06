export * from './auth.service';
import { AuthService } from './auth.service';
export * from './users.service';
import { UsersService } from './users.service';
export const APIS = [AuthService, UsersService];
