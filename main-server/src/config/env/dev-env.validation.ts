import { IsNumber, IsString, validateSync } from 'class-validator';
import { plainToInstance } from 'class-transformer';

//ConfigService를 쓰니까 타입가드를 못받더라?
//타입가드를 적극적으로 받을 수 있게 + validation까지 해봤음.
//인스턴스로 안만들고 그냥 쌩 클래스로 만드는게 나을것 같았다.
//환경변수는 init후 변할일이 없음 -> 상수취급

export class EnvConfig {
  @IsString()
  HI: string;

  @IsString()
  USERNAME: string;

  @IsNumber()
  POSTGRES_PORT: number;
}

export class EnvServer {
  private static envConfig;
  private static isInited: boolean;
  static init() {}
  static get() {}
}

//이렇게 env마다 클래스를 만들어 두는것?
//세부적인 조정 가능, 근데 복잡도 상승. -> 수정힘듦.
//아니면 아예 싸그리 환경변수 목록을 통일해서
//클래스는 하나만 두고 동적 init? -> 확장 쉬움.
//TODO EnvServer를 implements 하는 prod env 클래스 추후 생성
//TODO 또는 단일 ENV server만 두고 동적 init <- 이걸로 가는게 맞는듯.
export class Environment implements EnvServer {
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

export const validateDevEnv = (config: { [key: string]: any } | EnvConfig) => {
  const configInstance = plainToInstance(EnvConfig, config, {
    enableImplicitConversion: true,
    //config의 필드를 EnvConfig의 타입으로 알아서 변환시도. 실패시 변환안함.
    //EnvConfig에서 @Transform으로 할수도 있으나, 이렇게하면 깔끔함
    //타입변환이 그냥 numberstring -> number로 변환하는 작업밖에 없으니까
    //그리고, 어차피 변환이 실패하면 아래 오류처리에서 걸러짐.
  });

  const errors = validateSync(configInstance, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  Environment.init(configInstance);
  return configInstance;
};

export const getEnvPath = () => {
  // if (process.env.NODE_ENV ==='') {
  //
  // }
  return 'src/config/env/.env.development';
};
