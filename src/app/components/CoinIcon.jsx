import React from 'react'
import PropTypes from 'prop-types'
import config from 'Config'
import classNames from 'class-names'

const CoinIcon = ({ coin, tag: Tag, className, style, ...props }) => {
  const src = `${config.siteUrl}/img/coins/coin_${coin}.png`
  if (Tag === 'img') {
    props = Object.assign({ src }, props)
  } else {
    style = Object.assign({ backgroundImage: `url(${src})` }, style)
  }
  return (
    <Tag
      className={classNames('coin-icon', className)}
      style={style}
      {...props}
    />
  )
}

CoinIcon.propTypes = {
  coin: PropTypes.string.isRequired, // Coin symbol (e.g. ETH, BTC)
  tag: PropTypes.oneOfType([PropTypes.string, PropTypes.func]), // Component/HTML tag to render as
  className: PropTypes.string,
  style: PropTypes.object,
}

CoinIcon.defaultProps = {
  tag: 'img',
  className: '',
  style: {},
}

export default CoinIcon