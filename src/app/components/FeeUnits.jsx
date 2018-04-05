import React from 'react'
import PropTypes from 'prop-types'

import { numberish } from 'Utilities/propTypes'

import Units from 'Components/Units'
import Spinner from 'Components/Spinner'

const FeeUnits = ({ error, ...unitProps }) => {
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
  return (<Units {...unitProps}/>)
}

FeeUnits.propTypes = {
  ...Units.propTypes,
  value: numberish,
  error: PropTypes.any,
}

FeeUnits.defaultProps = {
  ...Units.defaultProps,
}

export default FeeUnits