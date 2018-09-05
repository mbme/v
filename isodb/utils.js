export const getMaxRev = records => records.reduce((maxRev, item) => item._rev > maxRev ? item._rev : maxRev, 0);
