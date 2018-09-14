import * as parser from '../../v-parser';
import { fuzzySearch } from '../../shared/utils';
import { assertAll } from '../../asserts';

const TYPE = 'note';

const validators = {
  'note-name': 'string!',
  'note-data': 'string',
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

    CREATE_NOTE({ name, data }, assets) {
      assertAll(
        [ name, 'note-name', validators ],
        [ data, 'note-data', validators ],
      );

      const fileIds = extractFileIds(data);

      return storage.createRecord(TYPE, { name, data }, fileIds, assets);
    },

    UPDATE_NOTE({ id, name, data }, assets) {
      assertAll(
        [ name, 'note-name', validators ],
        [ data, 'note-data', validators ],
      );

      const fileIds = extractFileIds(data);

      return storage.updateRecord(id, { name, data }, fileIds, assets);
    },

    DELETE_NOTE({ id }) {
      return storage.deleteRecord(id);
    },
  };
}
