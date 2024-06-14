import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection, Model, connect } from 'mongoose';
import {
  LetterDocument,
  LetterSchema,
} from '../../modules/letter/repository/schema/letter-document.schema';

export const startMongoMem = async (): Promise<MongoMem> => {
  const mongoMem = new MongoMem();
  await mongoMem.init();

  return mongoMem;
};

// https://github.com/nodkz/mongodb-memory-server/blob/master/packages/mongodb-memory-server-core/src/__tests__/singleDB.test.ts
export class MongoMem {
  private db: MongoMemoryServer;
  public connection: Connection;
  public uri;
  /**manually register, typeorm에는 엔티티 자동으로 긁어오는게 있었지만 몽고에는없음. */
  public models: {
    letter: { provide: 'LetterModel'; useValue: Model<LetterDocument> };
    // room: { provide: 'RoomModel'; useValue: Model<RoomDocument> };
  };

  async init() {
    this.db = await MongoMemoryServer.create();
    this.uri = this.db.getUri();
    this.connection = (await connect(this.uri)).connection;

    this.registerModles();
    return;
  }
  /**manually register, typeorm에는 엔티티 자동으로 긁어오는게 있었지만 몽고에는없음. */
  async registerModles() {
    const letterModel = this.connection.model<LetterDocument>(
      'Letter',
      LetterSchema
    );
    // const roomModel = this.connection.model<RoomDocument>('Room', RoomSchema);

    this.models = {
      letter: { provide: 'LetterModel', useValue: letterModel },
      //   room: { provide: 'RoomModel', useValue: roomModel },
    };
    return;
  }

  async destroy() {
    await this.connection.close();
    await this.db.stop();
    return;
  }
}
