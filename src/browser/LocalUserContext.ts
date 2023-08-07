import { User } from '../shared/User';

import { UserContext } from './UserContext';

export class LocalUserContext implements UserContext {
  user: User | undefined;

  setUser(user: User) {
    this.user = user;
  }

  getUser() {
    return this.user;
  }

  clearUser() {
    this.user = undefined;
  }

  removeUserProperty(property: string) {
    // eslint-disable-next-line no-unused-vars
    const { [property]: _, ...user } = this.user ?? {};
    this.user = user;
  }

  setUserProperty(property: string, value: unknown) {
    this.user = {
      ...this.user,
      [property]: value,
    };
  }
}
