import { combineReducers } from 'redux';
import router from './router/reducer';
import chrome from './chrome/reducer';
import notes from './notes/reducer';
import tracks from './tracks/reducer';

export default combineReducers({ router, chrome, notes, tracks });
