export default function createCoreStore(storage) {
  return {
    PING() {
      return 'PONG';
    },

    READ_ASSET({ id }) {
      return storage.readAsset(id);
    },
  };
}
