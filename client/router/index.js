import routerMiddleware from './middleware'
import routes from './routes'
import createRouter from './router'

export { propagateCurrentLocation } from './actions'

const router = createRouter()
router.useRoutes(routes)

export default routerMiddleware(router)
