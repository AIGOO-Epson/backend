import 'reflect-metadata';
import { validateDevEnv } from './dev-env.validation';
import { EnvConfig } from './env.definition';
import { Environment } from './env.service';

//TODO 1. fail case 작성예정. 2. 진짜 .env를 작성하고 난 후에 mock config을 다시 작성해야함.

describe('env validation, Environment class init test', () => {
  it('should validate and initialize the environment class', () => {
    // mock config for testing
    //env values are all string before vaidation,
    const originalMockConfig = {
      RDB_TYPE: 'postgres',
      RDB_HOST: 'pgdb',
      RDB_PORT: '5432',
      RDB_USERNAME: 'postgres',
      RDB_DATABASE: 'postgres',
      RDB_PASSWORD: 'postgres',
      MONGO_URI: 'mongodb://mgdb:27017/aigoo',
    };
    //after validation, some field's types will be changed
    const afterMockConfig: EnvConfig = {
      RDB_TYPE: 'postgres',
      RDB_HOST: 'pgdb',
      RDB_PORT: 5432,
      RDB_USERNAME: 'postgres',
      RDB_DATABASE: 'postgres',
      RDB_PASSWORD: 'postgres',
      MONGO_URI: 'mongodb://mgdb:27017/aigoo',
    };

    //transform mock to EnvConfig, vlalidate config, init Environment class
    const transformdConfig = validateDevEnv(originalMockConfig);

    //check well transformed
    expect(transformdConfig).toBeInstanceOf(EnvConfig);
    expect(transformdConfig).toEqual(afterMockConfig);

    //check well inited
    expect(() => Environment.get('RDB_TYPE')).not.toThrow();
    expect(Environment.get('RDB_TYPE')).toBe(afterMockConfig.RDB_TYPE);
    expect(Environment.get('RDB_PORT')).toBe(afterMockConfig.RDB_PORT);
  });
});
