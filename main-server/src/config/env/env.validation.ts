import { validateSync } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { EnvConfig } from './env.definition';
import { Environment } from './env.service';

export const validateDevEnv = (config: { [key: string]: any } | EnvConfig) => {
  const configInstance = plainToInstance(EnvConfig, config, {
    enableImplicitConversion: true,
    //config의 필드를 EnvConfig의 타입으로 알아서 변환시도. 실패시 변환안함.
  });

  const errors = validateSync(configInstance, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  Environment.init(configInstance);
  // Crypto.setSecret(Environment.get('CRYPTO_SECRET'));
  return configInstance;
};

export const getEnvPath = () => {
  if (process.env.NODE_ENV === 'development') {
    return 'src/config/env/.env.development';
  }
  if (process.env.NODE_ENV === 'production') {
    return 'src/config/env/.env.production';
  }
};
