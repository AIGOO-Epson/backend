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
  AZURE_STORAGE_CONNECTION_STRING: string;

  @IsString()
  NAVER_OCR_SECRET: string;
  @IsString()
  NAVER_OCR_URL: string;

  @IsString()
  KOREAN_ANALYZE_API_KEY: string;

  @IsString()
  EPSON_HOST: string;
  @IsString()
  EPSON_CLIENT_ID: string;
  @IsString()
  EPSON_SECRET: string;
  @IsString()
  EPSON_DEVICE: string;
}
