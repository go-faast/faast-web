import React from 'react'
import PropTypes from 'prop-types'

import config from 'Config'
import Icon from 'Components/Icon'

import Erc20Svg from 'Img/coin_ERC20.svg?inline'

const getPropsForSymbol = (symbol) => {
  symbol = symbol.toUpperCase()
  if (symbol === 'ERC20') {
    return { src: Erc20Svg, fill: '#fff' }
  }
  return { src: `${config.siteUrl}/img/coins/coin_${symbol}.png` }
}

const CoinIcon = ({ symbol, ...props }) => (
  <Icon {...getPropsForSymbol(symbol)} {...props}/>
)

CoinIcon.propTypes = {
  symbol: PropTypes.string.isRequired, // Coin symbol (e.g. ETH, BTC)
  ...Icon.stylePropTypes
}

CoinIcon.defaultProps = {
  size: 'md'
}

export default CoinIcon