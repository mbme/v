import { randomId } from '../randomizer';

const ID_ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyz';
const ID_LENGTH = 15;

export const getRandomId = () => randomId(ID_ALPHABET, ID_LENGTH);

export const findById = (records, id) => records.find(item => item._id === id);

export const RECORD_TYPES = {
  note: 'note',
};
