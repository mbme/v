import createStorage from 'server/storage';

const actions = {
  'PING': () => 'PONG',

  'LIST_RECORDS': (storage, { type }) => storage.listRecords(type),
  'READ_RECORD': (storage, { id }) => storage.readRecord(id),
  'CREATE_RECORD': (storage, { type, name, data }, files) => storage.createRecord(type, name, data, files),
  'UPDATE_RECORD': (storage, { id, name, data }, files) => storage.updateRecord(id, name, data, files),
  'DELETE_RECORD': (storage, { id }) => storage.deleteRecord(id),
  'READ_FILE': (storage, { id }) => storage.readFile(id),
};

export default async function createProcessor({ rootDir }) {
  const storage = await createStorage(rootDir);

  return {
    processAction({ action: { name, data }, files = [] }) {
      const action = actions[name];
      if (!action) throw new Error(`unknown action: ${name}`);

      return action(storage, data, files);
    },

    close() {
      return storage.close();
    },
  };
}
