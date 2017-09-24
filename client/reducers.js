import { combineReducers } from 'redux'
import router from './router/reducer'
import notes from './notes/reducer'

export default combineReducers({ router, notes })
