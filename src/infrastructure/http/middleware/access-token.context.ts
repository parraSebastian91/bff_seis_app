import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'node:async_hooks';

type AccessTokenStore = {
  accessToken?: string;
};

@Injectable()
export class AccessTokenContext {
  private readonly storage = new AsyncLocalStorage<AccessTokenStore>();

  runWithAccessToken<T>(accessToken: string | undefined, callback: () => T): T {
    return this.storage.run({ accessToken }, callback);
  }

  getAccessToken(): string | undefined {
    return this.storage.getStore()?.accessToken;
  }
}