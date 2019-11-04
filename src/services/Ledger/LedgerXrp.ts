import AppXrp from '@ledgerhq/hw-app-xrp'
import { proxy } from './util'

export default class LedgerXrp {

  getAddress = proxy(AppXrp, 'getAddress')
  signTransaction = proxy(AppXrp, 'signTransaction')
  getAppConfiguration = proxy(AppXrp, 'getAppConfiguration')

}
