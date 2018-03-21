import React from 'react'

import Icon from 'Components/Icon'
import ArrowIconSvg from 'Img/arrow-icon.svg?inline'

const ArrowIcon = ({ dir, ...props }) => (
  <Icon src={ArrowIconSvg} rotate={dir} {...props}/>
)

ArrowIcon.propTypes = {
  dir: Icon.propTypes.rotate,
  ...Icon.propTypes
}

ArrowIcon.defaultProps = {
  dir: 'up',
  color: 'primary',
  size: 'md'
}

export default ArrowIcon