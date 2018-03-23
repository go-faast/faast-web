import React from 'react'

import Icon from 'Components/Icon'
import LoadingSpinnerSvg from 'Img/loading-spinner.svg?inline'

const Spinner = ({ ...props }) => (
  <Icon src={LoadingSpinnerSvg} color='primary' width='5rem' height='0.125rem' {...props} />
)

Spinner.propTypes = {
  ...Icon.stylePropTypes
}

Spinner.defaultProps = {
  inline: false,
  size: 'sm'
}

export default Spinner