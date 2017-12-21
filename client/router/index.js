import routerMiddleware from './middleware'
import routes from './routes'
import createRouter from './router'

export { propagateCurrentLocation } from './actions'

export default routerMiddleware(createRouter(routes))
