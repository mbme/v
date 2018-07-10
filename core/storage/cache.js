import { uniq, flatten } from '../../shared/utils';

export default function createCache(records, files) {
  return {
    files,
    getFileIds: () => files.map(file => file.id),
    getFile: id => files.find(file => file.id === id),
    removeFile(id) {
      const pos = files.findIndex(file => file.id === id);
      if (pos !== -1) files.splice(pos, 1);
    },
    addFile: file => files.push(file),

    records,
    getRecordIds: () => records.map(record => record.id),
    getRecord: id => records.find(record => record.id === id),
    removeRecord(id) {
      const pos = records.findIndex(record => record.id === id);
      if (pos !== -1) records.splice(pos, 1);
    },
    addRecord: record => records.push(record),
    getFileIdsInUse: () => uniq(flatten(records.map(record => record.files.map(file => file.id)))),
  };
}
