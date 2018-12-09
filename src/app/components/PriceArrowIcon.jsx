import React from 'react'

import Icon from 'Components/Icon'
import PriceArrowIconSvg from 'Img/price-arrow.svg?inline'

const PriceArrowIcon = ({ dir, ...props }) => (
  <Icon src={PriceArrowIconSvg} rotate={dir} {...props}/>
)

PriceArrowIcon.propTypes = {
  dir: Icon.propTypes.rotate,
  ...Icon.stylePropTypes
}

PriceArrowIcon.defaultProps = {
  dir: 'up',
  color: 'primary',
  size: 'md'
}

export default PriceArrowIcon