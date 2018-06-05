import { RecordType } from '../records';
import { assertAll } from '../validator';

export default function createTracksStore(storage) {
  return {
    LIST_TRACKS({ size, skip, filter }) {
      return storage.listRecords(RecordType.track, { size, skip, filter });
    },
    READ_TRACK({ id }) {
      return storage.readRecord(id);
    },
    CREATE_TRACK({ artist, title, rating, categories, fileId }, files) {
      assertAll(
        [ artist, 'track-artist' ],
        [ title, 'track-title' ],
        [ rating, 'track-rating' ],
        [ categories, 'track-categories' ],
        [ fileId, 'file-id' ],
      );
      return storage.createRecord(RecordType.track, { artist, title, rating, categories, fileId }, files);
    },
    UPDATE_TRACK({ id, artist, title, rating, categories, fileId }, files) {
      assertAll(
        [ artist, 'track-artist' ],
        [ title, 'track-title' ],
        [ rating, 'track-rating' ],
        [ categories, 'track-categories' ],
        [ fileId, 'file-id' ],
      );
      return storage.updateRecord(id, { artist, title, rating, categories, fileId }, files);
    },
    DELETE_TRACK({ id }) {
      return storage.deleteRecord(id);
    },
  };
}
