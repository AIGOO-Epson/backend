import 'reflect-metadata';
import { validateDevEnv, EnvConfig, Environment } from './dev-env.validation';

//TODO fail case 작성예정.

describe('env validation, Environment class init test', () => {
  it('should validate and initialize the environment class', () => {
    // mock config for testing
    //env values are all string before vaidation,
    const mockConfig = {
      HI: 'hello',
      USERNAME: 'testuser',
      POSTGRES_PORT: '5432',
    };
    //after validation, some field's types will be changed
    const transformdMockConfig: EnvConfig = {
      HI: 'hello',
      USERNAME: 'testuser',
      POSTGRES_PORT: 5432,
    };

    //transform mock to EnvConfig, vlalidate config, init Environment class
    const transformdConfig = validateDevEnv(mockConfig);

    //check well transformed
    expect(transformdConfig).toBeInstanceOf(EnvConfig);
    expect(transformdConfig).toEqual(transformdMockConfig);

    //check well inited
    expect(() => Environment.get('HI')).not.toThrow();
    expect(Environment.get('HI')).toBe(mockConfig.HI);
    expect(Environment.get('USERNAME')).toBe(mockConfig.USERNAME);
  });
});
