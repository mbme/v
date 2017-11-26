import { combineReducers } from 'redux'
import router from './router/reducer'
import notes from './notes/reducer'
import chrome from './chrome/reducer'

export default combineReducers({ router, notes, chrome })
