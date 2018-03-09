import { RecordType } from 'server/types';
import createStorage from 'server/storage';

const actions = {
  'PING': () => 'PONG',

  'LIST_NOTES': storage => storage.listRecords(RecordType.note),
  'READ_NOTE': (storage, { id }) => storage.readRecord(id),
  'CREATE_NOTE': (storage, { name, data }, files) => storage.createRecord(RecordType.note, name, data, files),
  'UPDATE_NOTE': (storage, { id, name, data }, files) => storage.updateRecord(id, name, data, files),
  'DELETE_NOTE': (storage, { id }) => storage.deleteRecord(id),

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
