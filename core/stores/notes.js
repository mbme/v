import * as parser from 'shared/parser';
import { fuzzySearch } from 'shared/utils';
import { assertAll } from '../validator';

const TYPE = 'note';

const validation = {
  name: 'string!',
  data: 'string',
};

const extractFileIds = data => parser.extractFileIds(parser.parse(data));

export default function createNotesStore(storage) {
  return {
    LIST_NOTES({ size, skip, filter = '' }) {
      return storage.listRecords({
        size,
        skip,
        filter: record => record.type === TYPE && fuzzySearch(filter, record.fields.name),
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

      return storage.createRecord(TYPE, { name, data }, fileIds, attachments);
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
