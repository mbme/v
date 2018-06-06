import * as parser from 'shared/parser';

export const type = 'note';

export const extractFileIds = fields => parser.extractFileIds(parser.parse(fields.data));
