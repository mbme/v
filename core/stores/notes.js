import { fuzzySearch } from 'shared/utils';
import { RecordType } from '../records';
import { assertAll } from '../validator';

export default function createNotesStore(storage) {
  return {
    LIST_NOTES({ size, skip, filter = '' }) {
      return storage.listRecords(RecordType.note, {
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
        [ name, 'note-name' ],
        [ data, 'note-data' ],
      );
      return storage.createRecord(RecordType.note, { name, data }, files);
    },
    UPDATE_NOTE({ id, name, data }, files) {
      assertAll(
        [ name, 'note-name' ],
        [ data, 'note-data' ],
      );
      return storage.updateRecord(id, { name, data }, files);
    },
    DELETE_NOTE({ id }) {
      return storage.deleteRecord(id);
    },
  };
}
