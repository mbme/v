import {
  uniq,
  flatten,
  findById,
  removeMut,
} from '../../utils';

export default function createCache(records, files) {
  return {
    files,
    getFileIds: () => files.map(file => file.id),
    getFile: id => files.find(file => file.id === id),
    removeFile: id => removeMut(files, findById(files, id)),
    addFile: file => files.push(file),

    records,
    getRecordIds: () => records.map(record => record.id),
    getRecord: id => records.find(record => record.id === id),
    removeRecord: id => removeMut(records, findById(records, id)),
    addRecord: record => records.push(record),
    getFileIdsInUse: () => uniq(flatten(records.map(record => record.files.map(file => file.id)))),
  };
}
