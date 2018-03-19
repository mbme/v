import { fuzzySearch } from 'shared/utils';

export const type = 'track';

export const validation = {
  'track-artist': 'string!',
  'track-title': 'string!',
  'track-rating': val => [ 1, 2, 3, 4, 5 ].includes(val),
  'track-categories': 'string![]',
};

export const extractFileIds = fields => [ fields.fileId ];

export const applyFilter = (record, filter) => fuzzySearch(filter, [ record.fields.name, record.fields.artist ].join(' '));
