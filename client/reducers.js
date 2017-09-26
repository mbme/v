import { combineReducers } from 'redux'
import router from './router/reducer'
import components from './components/reducer'
import notes from './notes/reducer'

export default combineReducers({ router, components, notes })
