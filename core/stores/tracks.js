import { fuzzySearch } from 'shared/utils';
import { assertAll } from '../validator';

const TYPE = 'track';

const validators = {
  'track-artist': 'string!',
  'track-title': 'string!',
  'track-rating': val => [ 1, 2, 3, 4, 5 ].includes(val),
  'track-categories': 'string![]',
};

export default function createTracksStore(storage) {
  return {
    LIST_TRACKS({ size, skip, filter = '' }) {
      return storage.listRecords({
        size,
        skip,
        filter: record => record.type === TYPE && fuzzySearch(filter, [ record.fields.name, record.fields.artist ].join(' ')),
      });
    },

    READ_TRACK({ id }) {
      return storage.readRecord(id);
    },

    CREATE_TRACK({ artist, title, rating, categories, fileId }, attachments) {
      assertAll(
        [ artist, 'track-artist', validators ],
        [ title, 'track-title', validators ],
        [ rating, 'track-rating', validators ],
        [ categories, 'track-categories', validators ],
        [ fileId, 'file-id' ],
      );
      return storage.createRecord(TYPE, { artist, title, rating, categories, fileId }, [ fileId ], attachments);
    },

    UPDATE_TRACK({ id, artist, title, rating, categories, fileId }, attachments) {
      assertAll(
        [ artist, 'track-artist', validators ],
        [ title, 'track-title', validators ],
        [ rating, 'track-rating', validators ],
        [ categories, 'track-categories', validators ],
        [ fileId, 'file-id' ],
      );
      return storage.updateRecord(id, { artist, title, rating, categories, fileId }, [ fileId ], attachments);
    },

    DELETE_TRACK({ id }) {
      return storage.deleteRecord(id);
    },
  };
}
