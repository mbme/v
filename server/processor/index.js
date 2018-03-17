import { RecordType, assertAll } from './types';
import createStorage from './storage';

const actions = {
  'PING': () => 'PONG',

  'READ_FILE': (storage, { id }) => storage.readFile(id),

  // NOTES
  'LIST_NOTES': storage => storage.listRecords(RecordType.note),
  'READ_NOTE': (storage, { id }) => storage.readRecord(id),
  'CREATE_NOTE': (storage, { name, data }, files) => {
    assertAll(
      [ name, 'note-name' ],
      [ data, 'note-data' ],
    );
    return storage.createRecord(RecordType.note, { name, data }, files);
  },
  'UPDATE_NOTE': (storage, { id, name, data }, files) => {
    assertAll(
      [ name, 'note-name' ],
      [ data, 'note-data' ],
    );
    return storage.updateRecord(id, { name, data }, files);
  },
  'DELETE_NOTE': (storage, { id }) => storage.deleteRecord(id),

  // TRACKS
  'LIST_TRACKS': storage => storage.listRecords(RecordType.track),
  'READ_TRACK': (storage, { id }) => storage.readRecord(id),
  'CREATE_TRACK': (storage, { artist, title, rating, categories, fileId }, files) => {
    assertAll(
      [ artist, 'track-artist' ],
      [ title, 'track-title' ],
      [ rating, 'track-rating' ],
      [ categories, 'track-categories' ],
      [ fileId, 'file-id' ],
    );
    return storage.createRecord(RecordType.track, { artist, title, rating, categories, fileId }, files);
  },
  'UPDATE_TRACK': (storage, { id, artist, title, rating, categories, fileId }, files) => {
    assertAll(
      [ artist, 'track-artist' ],
      [ title, 'track-title' ],
      [ rating, 'track-rating' ],
      [ categories, 'track-categories' ],
      [ fileId, 'file-id' ],
    );
    return storage.updateRecord(id, { artist, title, rating, categories, fileId }, files);
  },
  'DELETE_TRACK': (storage, { id }) => storage.deleteRecord(id),
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
