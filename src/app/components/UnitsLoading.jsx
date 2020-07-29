import React from 'react'
import PropTypes from 'prop-types'

import { numberish } from 'Utilities/propTypes'

import Units from 'Components/Units'
import UnitsWithFiat from 'Components/UnitsWithFiat'
import Spinner from 'Components/Spinner'

const UnitsLoading = ({ error, showFiat, ...unitProps }) => {
  const { tag: Tag, value, symbol, showSymbol } = unitProps
  if (typeof value === 'undefined') {
    if (error) {
      return (<Tag className='text-danger'> - </Tag>)
    }
    return (<Spinner inline size='sm'/>)
  }
  if (value === null) {
    return (<Tag><i>TBD</i>{showSymbol && symbol ? ` ${symbol}` : ''}</Tag>)
  }
  const UnitsTag = showFiat ? UnitsWithFiat : Units
  return (<UnitsTag {...unitProps}/>)
}

UnitsLoading.propTypes = {
  ...Units.propTypes,
  value: numberish,
  error: PropTypes.any,
  showFiat: PropTypes.bool,
}

UnitsLoading.defaultProps = {
  ...Units.defaultProps,
  showFiat: false
}

export default UnitsLoading
