//ConfigService를 쓰니까 타입가드를 못받더라?
//타입가드를 적극적으로 받을 수 있게 + validation까지 해봤음.
//인스턴스로 안만들고 그냥 쌩 클래스로 만드는게 나을것 같았다.
//환경변수는 init후 변할일이 없음 -> 상수취급

import { EnvConfig } from './env.definition';

class IEnvironment {
  private static envConfig;
  private static isInited: boolean;
  static init() {}
  static get() {}
}

export class Environment implements IEnvironment {
  private static envConfig: EnvConfig;
  private static isInited: boolean = false;

  static init(env: EnvConfig) {
    if (this.isInited) {
      return;
    }

    this.envConfig = env;
    this.isInited = true;
  }

  static get<T extends keyof EnvConfig>(key: T): EnvConfig[T] {
    if (!this.isInited) {
      console.trace();
      throw new Error('env not initd yet');
    }
    return this.envConfig[key];
  }
}
