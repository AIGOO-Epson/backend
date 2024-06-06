export const getMongoUri = () => {
  // if (process.env.NODE_ENV === 'development') {
  // }
  return devMongoUri;
};

const devMongoUri = 'mongodb://mgdb:27017/aigoo';
