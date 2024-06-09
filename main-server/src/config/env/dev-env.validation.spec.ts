import 'reflect-metadata';
import { validateDevEnv, EnvConfig, Environment } from './dev-env.validation';

//TODO 1. fail case 작성예정. 2. 진짜 .env를 작성하고 난 후에 mock config을 다시 작성해야함.

describe('env validation, Environment class init test', () => {
  it('should validate and initialize the environment class', () => {
    // mock config for testing
    //env values are all string before vaidation,
    const originalMockConfig = {
      HI: 'hello',
      USERNAME: 'testuser',
      POSTGRES_PORT: '5432',
    };
    //after validation, some field's types will be changed
    const afterMockConfig: EnvConfig = {
      HI: 'hello',
      USERNAME: 'testuser',
      POSTGRES_PORT: 5432,
    };

    //transform mock to EnvConfig, vlalidate config, init Environment class
    const transformdConfig = validateDevEnv(originalMockConfig);

    //check well transformed
    expect(transformdConfig).toBeInstanceOf(EnvConfig);
    expect(transformdConfig).toEqual(afterMockConfig);

    //check well inited
    expect(() => Environment.get('HI')).not.toThrow();
    expect(Environment.get('HI')).toBe(afterMockConfig.HI);
    expect(Environment.get('USERNAME')).toBe(afterMockConfig.USERNAME);
  });
});
