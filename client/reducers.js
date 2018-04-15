import { combineReducers } from 'redux';
import router from './router/reducer';
import chrome from './chrome/reducer';

export default combineReducers({ router, chrome });
