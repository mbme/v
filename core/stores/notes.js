import { fuzzySearch } from 'shared/utils';
import { assertAll } from '../validator';

const RecordType = 'note';

const validation = {
  name: 'string!',
  data: 'string',
};

export default function createNotesStore(storage) {
  return {
    LIST_NOTES({ size, skip, filter = '' }) {
      return storage.listRecords(RecordType, {
        size,
        skip,
        filter: record => fuzzySearch(filter, record.fields.name),
      });
    },

    READ_NOTE({ id }) {
      return storage.readRecord(id);
    },

    CREATE_NOTE({ name, data }, files) {
      assertAll(
        [ name, validation.name ],
        [ data, validation.data ],
      );
      return storage.createRecord(RecordType, { name, data }, files);
    },

    UPDATE_NOTE({ id, name, data }, files) {
      assertAll(
        [ name, validation.name ],
        [ data, validation.data ],
      );
      return storage.updateRecord(id, { name, data }, files);
    },

    DELETE_NOTE({ id }) {
      return storage.deleteRecord(id);
    },
  };
}
