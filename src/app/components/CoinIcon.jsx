import React from 'react'
import PropTypes from 'prop-types'

import config from 'Config'
import Icon from 'Components/Icon'

const CoinIcon = ({ symbol, ...props }) => (
  <Icon src={`${config.siteUrl}/img/coins/coin_${symbol}.png`} {...props}/>
)

CoinIcon.propTypes = {
  symbol: PropTypes.string.isRequired, // Coin symbol (e.g. ETH, BTC)
  ...Icon.stylePropTypes
}

CoinIcon.defaultProps = {
  size: 'md'
}

export default CoinIcon