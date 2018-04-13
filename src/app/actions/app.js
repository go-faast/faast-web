import { createAction } from 'redux-act'
import queryString from 'query-string'
import idb from 'Utilities/idb'
import { restoreFromAddress } from 'Utilities/storage'
import blockstack from 'Utilities/blockstack'
import { filterUrl } from 'Utilities/helpers'
import log from 'Utilities/log'
import { getDefaultPortfolio } from 'Selectors'

import { retrieveAssets } from './asset'
import { setSettings } from './redux'
import { setSwaps } from './swap'
import { restoreAllPortfolios, updateAllHoldings, restoreSwapPolling } from './portfolio'

export const appReady = createAction('APP_READY')
export const appError = createAction('APP_ERROR')

export const restoreState = (dispatch, getState) => Promise.resolve()
  .then(() => dispatch(restoreAllPortfolios()))
  .then(() => {
    const wallet = getDefaultPortfolio(getState())
    const addressState = restoreFromAddress(wallet && wallet.id)
    if (addressState) {
      const swaps = addressState.swap
      if (swaps.length > 0) {
        dispatch(setSwaps(swaps))
        dispatch(restoreSwapPolling())
      }
      const settings = addressState.settings
      dispatch(setSettings(settings))
    }
    dispatch(updateAllHoldings())
  })
  .catch((e) => {
    log.error(e)
    throw new Error('Failed to restore app state')
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
  .catch((e) => {
    log.error('Failed to setup logger', e)
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
  .catch((e) => {
    log.error('Failed to setup Blockstack', e)
  })

export const setupLedger = () => Promise.resolve()
  .then(() => {
    window.faast.hw = window.faast.hw || {}
    if (window.ledger) {
      return window.ledger.comm_u2f.create_async()
        .then((comm) => {
          window.faast.hw.ledger = new window.ledger.eth(comm)
        })
    }
  })
  .catch((e) => {
    log.error('Failed to setup Ledger', e)
  })

export const init = () => (dispatch) => Promise.resolve()
  .then(() => dispatch(setupLogger))
  .then(() => dispatch(retrieveAssets())) // asset list required to restore wallets
  .then(() => dispatch(restoreState))
  .then(() => dispatch(setupBlockstack))
  .then(() => dispatch(setupLedger))
  .then(() => dispatch(appReady()))
  .catch((e) => {
    log.error(e)
    const message = e.message || 'Unknown error'
    dispatch(appError(message))
  })
