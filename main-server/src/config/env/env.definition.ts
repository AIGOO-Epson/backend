import { IsNumber, IsString, Matches } from 'class-validator';

export class EnvConfig {
  @Matches(/^(postgres|mysql)$/, {
    message: 'RDB_TYPE must be compatible with TypeOrmConfig.',
  })
  RDB_TYPE: 'postgres' | 'mysql';
  @IsString()
  RDB_HOST: string;
  @IsNumber()
  RDB_PORT: number;
  @IsString()
  RDB_USERNAME: string;
  @IsString()
  RDB_DATABASE: string;
  @IsString()
  RDB_PASSWORD: string;

  @IsString()
  MONGO_URI: string;

  @IsString()
  CRYPTO_SECRET: string;

  @IsString()
  AZURE_STORAGE_CONNECTION_STRING: string;
}
