import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getMongoUri } from './config/db/mongoose.config';
import { getTypeormConfig } from './config/db/typeorm.config';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(getTypeormConfig()),
    MongooseModule.forRoot(getMongoUri()),
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
