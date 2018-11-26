import React from 'react'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import { compose, setDisplayName, setPropTypes, } from 'recompose'
import classNames from 'class-names'
import PropTypes from 'prop-types'

import { handleWatchlist } from 'Actions/asset'
import { isAssetOnWatchlist } from 'Selectors/asset'

const WatchlistStar = ({ symbol, onWatchlist, handleWatchlist, className, ...props }) => {
  return (
    <i 
      onClick={() => handleWatchlist(symbol)} 
      className={classNames(`fa ${className}`, onWatchlist ? 'watchlist-selected fa-star' : 'watchlist-unselected fa-star-o')}
      {...props}
    >
    </i>
  )
}

export default compose(
  setDisplayName('WatchlistStar'),
  connect(createStructuredSelector({
    onWatchlist: (state, { symbol }) => isAssetOnWatchlist(state, symbol),
  }),{
    handleWatchlist: handleWatchlist,
  }),
  setPropTypes({
    symbol: PropTypes.string.isRequired,
  }),
)(WatchlistStar)
