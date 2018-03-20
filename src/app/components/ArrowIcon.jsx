import React from 'react'
import PropTypes from 'prop-types'
import { reduceStyles, rotate, resize, fill } from 'Utilities/style'

import Icon from 'Img/arrow-icon.svg?inline'

const defaultStyle = { width: '2rem', height: '2rem' }

const ArrowIcon = ({ dir, color, size, style, ...props }) => (
  <Icon style={reduceStyles(
    defaultStyle,
    resize(size),
    rotate(dir),
    fill(color),
    style
  )} {...props}/>
)

ArrowIcon.propTypes = {
  dir: PropTypes.string,
  color: PropTypes.string,
  size: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
}

ArrowIcon.defaultProps = {
  dir: 'up',
  color: 'white',
  size: 'md',
}

export default ArrowIcon