import { createAction } from 'redux-act'
import queryString from 'query-string'
import idb from 'Utilities/idb'
import { restoreFromAddress } from 'Utilities/storage'
import { statusAllSwaps } from 'Utilities/swap'
import blockstack from 'Utilities/blockstack'
import { filterUrl } from 'Utilities/helpers'
import log from 'Utilities/log'
import { getCurrentWallet } from 'Selectors'

import { getAssets } from './request'
import { setSwapData, setSettings } from './redux'
import { restoreAllWallets } from './wallet'

export const appReady = createAction('APP_READY')
export const appError = createAction('APP_ERROR')

export const restoreState = (dispatch, getState) => 
  dispatch(restoreAllWallets())
    .then(() => {
      const wallet = getCurrentWallet(getState())
      const addressState = restoreFromAddress(wallet && wallet.address) || {}
      const status = statusAllSwaps(addressState.swap)
      const swap = (status === 'unavailable' || status === 'unsigned' || status === 'unsent') ? undefined : addressState.swap
      dispatch(setSwapData(swap))
      const settings = addressState.settings
      dispatch(setSettings(settings))
    })

export const setupLogger = () => Promise.resolve()
  .then(() => {
    const query = queryString.parse(window.location.search)
    if (query.log_level) window.faast.log_level = query.log_level

    return idb.setup(['logging'])
      .then(() => {
        log.info('idb set up')
        if (query.export) {
          return idb.exportDb(query.export)
        }
      })
      .then(() => idb.removeOld('logging'))
  })

export const setupBlockstack = (dispatch) => Promise.resolve()
  .then(() => {
    if (blockstack.isSignInPending()) {
      log.info('blockstack signin pending')
      return blockstack.handlePendingSignIn()
        .then(() => window.location.replace(filterUrl()))
    }
  })
  .then(() => {
    if (blockstack.isUserSignedIn()) {
      return blockstack.getSettings()
        .then((settings) => dispatch(setSettings(settings)))
    }
  })
  .catch(log.error)

export const setupLedger = () => Promise.resolve()
  .then(() => {
    window.faast.hw = window.faast.hw || {}
    if (window.ledger) {
      return window.ledger.comm_u2f.create_async()
        .then((comm) => {
          window.faast.hw.ledger = new window.ledger.eth(comm)
        })
        .catch(log.error)
    }
  })

export const init = () => (dispatch) => Promise.resolve()
  .then(() => dispatch(setupLogger))
  .then(() => dispatch(restoreState))
  .then(() => dispatch(setupBlockstack))
  .then(() => dispatch(setupLedger))
  .then(() => dispatch(getAssets()))
  .then(() => dispatch(appReady()))
  .catch((e) => {
    log.error(e)
    const message = e.message || 'Unknown error'
    dispatch(appError(message))
    throw message
  })
