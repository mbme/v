export default function createCoreStore(storage) {
  return {
    PING() {
      return 'PONG';
    },
    READ_FILE({ id }) {
      return storage.readFile(id);
    },
  };
}
