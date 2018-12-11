import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import { compose, setDisplayName, setPropTypes } from 'recompose'

import CoinIcon from 'Components/CoinIcon'

const CoinSymbol = ({ symbol, ...props }) => (
  <Fragment>
    <CoinIcon className='mr-1' symbol={symbol} size='sm' inline {...props}/>
    {symbol}
  </Fragment>
)

export default compose(
  setDisplayName('Pair'),
  setPropTypes({
    from: PropTypes.string, // asset symbol
    to: PropTypes.string, // asset symbol
  })
)(({ from, to }) => (
  <Fragment>
    <CoinSymbol symbol={from}/>
    <i className='fa fa-long-arrow-right text-grey mx-2'/> 
    <CoinSymbol symbol={to}/>
  </Fragment>
))
