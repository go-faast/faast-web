import React from 'react'
import PropTypes from 'prop-types'

import Icon from 'Components/Icon'
import { reduceStyles } from 'Utilities/style'
import LoadingSpinnerSvg from 'Img/loading-spinner.svg?inline'

const inlineStyle = {
  display: 'inline-block',
  lineHeight: 0,
  verticalAlign: 'middle'
}

const blockStyle = {
  display: 'block'
}

const Spinner = ({ inline, style, ...props }) => (
  <Icon src={LoadingSpinnerSvg} color='primary' width='5rem' height='0.125rem' style={reduceStyles(
    (inline ? inlineStyle : blockStyle),
    style
  )} {...props} />
)

Spinner.propTypes = {
  inline: PropTypes.bool,
  ...Icon.stylePropTypes
}

Spinner.defaultProps = {
  inline: false,
  size: 'md'
}

export default Spinner