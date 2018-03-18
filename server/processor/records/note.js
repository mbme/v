import * as parser from 'shared/parser';

export const type = 'note';

export const validation = {
  'note-name': 'string!',
  'note-data': 'string',
};

export const extractFileIds = fields => parser.extractFileIds(parser.parse(fields.data));
