import { newScopedCreateAction } from 'Utilities/action'
import { restoreFromAddress } from 'Utilities/storage'
import blockstack from 'Utilities/blockstack'
import { filterUrl } from 'Utilities/helpers'
import log from 'Utilities/log'
import { getDefaultPortfolio } from 'Selectors'

import { retrieveAssets, restoreAssets } from './asset'
import { setSettings } from './settings'
import { restoreAllPortfolios, updateAllHoldings } from './portfolio'
import { restoreSwundle } from './swap'

const createAction = newScopedCreateAction(__filename)

export const appReady = createAction('READY')
export const appError = createAction('ERROR')
export const resetAll = createAction('RESET_ALL')

export const restoreState = (dispatch, getState) => Promise.resolve()
  .then(() => {
    const assetCache = restoreFromAddress('cache:asset')
    if (assetCache) {
      dispatch(restoreAssets(assetCache))
      dispatch(retrieveAssets())
    } else {
      return dispatch(retrieveAssets()) // asset list required to restore wallets
    }
  })
  .then(() => dispatch(restoreAllPortfolios()))
  .then(() => {
    const wallet = getDefaultPortfolio(getState())
    const addressState = restoreFromAddress(wallet && wallet.id)
    if (addressState) {
      dispatch(restoreSwundle(addressState))
      const settings = addressState.settings
      dispatch(setSettings(settings))
    }
    dispatch(updateAllHoldings())
  })
  .catch((e) => {
    log.error(e)
    throw new Error('Failed to restore app state')
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
  .then(() => dispatch(restoreState))
  .then(() => dispatch(setupBlockstack))
  .then(() => dispatch(setupLedger))
  .then(() => dispatch(appReady()))
  .catch((e) => {
    log.error(e)
    const message = e.message || 'Unknown error'
    dispatch(appError(message))
  })
