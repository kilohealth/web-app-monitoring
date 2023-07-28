import { User } from '../shared/User';

export interface UserContext {
  setUser(user: User): void;

  getUser(): User | undefined;

  clearUser(): void;

  removeUserProperty(property: string): void;

  setUserProperty(property: string, value: unknown): void;
}
