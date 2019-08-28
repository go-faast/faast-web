/**
 * Exports an interface for interacting with Ledger hardware wallets. Example usage:
 * import Ledger from 'Services/Ledger'
 * Ledger.eth.getAddress("m/44'/0'/0'/0")
 */

import * as ledgerLogger from '@ledgerhq/logs'
import log from 'Log'

import LedgerBtc from './LedgerBtc'
import LedgerEth from './LedgerEth'

ledgerLogger.listen((logObject: ledgerLogger.Log) => {
  log.debug('ledger log', logObject)
})

export default {
  eth: new LedgerEth(),
  btc: new LedgerBtc(),
}
