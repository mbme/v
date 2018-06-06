import * as parser from 'shared/parser';
import { fuzzySearch } from 'shared/utils';
import { assertAll } from '../validator';

const RecordType = 'note';

const validation = {
  name: 'string!',
  data: 'string',
};

const extractFileIds = data => parser.extractFileIds(parser.parse(data));

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

    CREATE_NOTE({ name, data }, attachments) {
      assertAll(
        [ name, validation.name ],
        [ data, validation.data ],
      );

      const fileIds = extractFileIds(data);

      return storage.createRecord(RecordType, { name, data }, fileIds, attachments);
    },

    UPDATE_NOTE({ id, name, data }, attachments) {
      assertAll(
        [ name, validation.name ],
        [ data, validation.data ],
      );

      const fileIds = extractFileIds(data);

      return storage.updateRecord(id, { name, data }, fileIds, attachments);
    },

    DELETE_NOTE({ id }) {
      return storage.deleteRecord(id);
    },
  };
}
