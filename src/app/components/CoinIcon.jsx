import React from 'react'
import PropTypes from 'prop-types'
import config from 'Config'
import { reduceStyles, resize } from 'Utilities/style'

const defaultStyle = { width: '1rem', height: '1rem' }

const CoinIcon = ({ coin, size, tag: Tag, style, ...props }) => {
  const src = `${config.siteUrl}/img/coins/coin_${coin}.png`
  if (Tag === 'img') {
    props = { src, ...props }
  } else {
    style = { backgroundImage: `url(${src})`, ...style }
  }
  return (
    <Tag style={reduceStyles(
        defaultStyle,
        resize(size),
        style
      )}
      {...props}
    />
  )
}

CoinIcon.propTypes = {
  coin: PropTypes.string.isRequired, // Coin symbol (e.g. ETH, BTC)
  size: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  tag: PropTypes.oneOfType([PropTypes.string, PropTypes.func]), // Component/HTML tag to render as
  className: PropTypes.string,
  style: PropTypes.object,
}

CoinIcon.defaultProps = {
  size: 'md',
  tag: 'img',
  className: '',
  style: {},
}

export default CoinIcon