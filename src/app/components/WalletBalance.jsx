import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import { compose, setDisplayName, setPropTypes, defaultProps, withProps } from 'recompose'

import log from 'Log'
import display from 'Utilities/display'
import Expandable from 'Components/Expandable'
import Units from 'Components/Units'

const fiatSymbols = ['$']

export default compose(
  setDisplayName('WalletBalance'),
  setPropTypes({
    wallet: PropTypes.object,
    symbol: PropTypes.string,
  }),
  defaultProps({
    wallet: {},
    symbol: '$',
  }),
  withProps(({
    symbol, wallet: {
      holdingsLoaded, holdingsError, totalFiat, 
      balancesLoaded, balancesError, balances
    }
  }) => {
    const isFiat = fiatSymbols.includes(symbol)
    if (isFiat && typeof totalFiat === 'undefined') {
      log.warn('WalletBalance cannot show fiat balance without wallet holdings. Please use getWalletWithHoldings selector for wallet prop')
    }
    return {
      isFiat,
      loaded: isFiat
        ? (holdingsLoaded || holdingsError)
        : (balancesLoaded || balancesError),
      error: isFiat
        ? (!holdingsLoaded && holdingsError)
        : (!balancesLoaded && balancesError),
      balance: (isFiat ? totalFiat : balances[symbol]) || 0
    }
  }),
)(({ symbol, isFiat, loaded, error, balance }) => 
  loaded ? (
    <Fragment>
      {error && (
        <Expandable
          shrunk={<i className='fa fa-exclamation-triangle text-danger mr-2'/>}
          expanded={error}/>
      )}
      {isFiat
        ? display.fiat(balance)
        : (<Units symbol={symbol} value={balance} precision={4}/>)}
    </Fragment>
  ) : (
    <Fragment>
      <i className='fa fa-spinner fa-pulse'/> {!isFiat && symbol}
    </Fragment>
  )
)
