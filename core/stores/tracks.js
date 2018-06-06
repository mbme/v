import { fuzzySearch } from 'shared/utils';
import { assertAll } from '../validator';

const RecordType = 'track';

const validation = {
  artist: 'string!',
  title: 'string!',
  rating: val => [ 1, 2, 3, 4, 5 ].includes(val),
  categories: 'string![]',
};

export default function createTracksStore(storage) {
  return {
    LIST_TRACKS({ size, skip, filter = '' }) {
      return storage.listRecords(RecordType, {
        size,
        skip,
        filter: record => fuzzySearch(filter, [ record.fields.name, record.fields.artist ].join(' ')),
      });
    },

    READ_TRACK({ id }) {
      return storage.readRecord(id);
    },

    CREATE_TRACK({ artist, title, rating, categories, fileId }, files) {
      assertAll(
        [ artist, validation.artist ],
        [ title, validation.title ],
        [ rating, validation.rating ],
        [ categories, validation.categories ],
        [ fileId, 'file-id' ],
      );
      return storage.createRecord(RecordType, { artist, title, rating, categories, fileId }, files);
    },

    UPDATE_TRACK({ id, artist, title, rating, categories, fileId }, files) {
      assertAll(
        [ artist, validation.artist ],
        [ title, validation.title ],
        [ rating, validation.rating ],
        [ categories, validation.categories ],
        [ fileId, 'file-id' ],
      );
      return storage.updateRecord(id, { artist, title, rating, categories, fileId }, files);
    },

    DELETE_TRACK({ id }) {
      return storage.deleteRecord(id);
    },
  };
}
