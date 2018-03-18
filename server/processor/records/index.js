import * as note from './note';
import * as track from './track';

export function extractFileIds(type, fields) {
  if (type === note.type) return note.extractFileIds(fields);

  if (type === track.type) return track.extractFileIds(fields);

  throw new Error(`extractFileIds NYI for ${type}`);
}

export const RecordType = {
  note: note.type,
  track: track.type,
};

export const validation = {
  'record-type': val => Object.values(RecordType).includes(val),
  'record-id': 'positive-integer',
  'record-fields': 'object',

  ...note.validation,
  ...track.validation,
};
