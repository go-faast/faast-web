import { createHashHistory, createBrowserHistory } from 'history'
import config from 'Config'

const { isIpfs } = config
const createHistory = isIpfs ? createHashHistory : createBrowserHistory

const history = createHistory({ basename: process.env.ROUTER_BASE_NAME })

if (!isIpfs) {
  // Redirect legacy hash routes
  if ((window.location.hash || '').startsWith('#/')) {
    history.replace(window.location.hash.slice(1))
  }
}

export default history
