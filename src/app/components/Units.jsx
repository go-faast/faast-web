import React from 'react'
import PropTypes from 'prop-types'
import BigNumber from 'bignumber.js'
import { omit } from 'lodash'

import { toBigNumber } from 'Utilities/convert'
import { numberish } from 'Utilities/propTypes'
import Expandable from 'Components/Expandable'

class Units extends React.Component {
  render() {
    const { value: propValue, symbol, showSymbol, precision, maxDigits, prefix, ...props } = this.props
    const value = toBigNumber(propValue)
    let expanded = value.toFormat()
    let shrunk = expanded
    if (precision) {
      shrunk = value.toDigits(precision, BigNumber.ROUND_DOWN).toFormat()
      const digitCount = shrunk.replace(/\D/g, '').length
      if (digitCount > maxDigits) {
        shrunk = value.toExponential(precision)
      }
    }
    if (symbol) {
      expanded = `${expanded} ${symbol}` // Expanded form should always include symbol
      if (showSymbol) {
        shrunk = `${shrunk} ${symbol}`
      }
    }
    if (prefix) {
      shrunk = prefix + shrunk
    }
    return (<Expandable shrunk={shrunk} expanded={expanded} {...props}/>)
  }
}

Units.propTypes = {
  ...omit(Expandable.propTypes, 'shrunk', 'expanded'),
  value: numberish.isRequired,
  symbol: PropTypes.string,
  showSymbol: PropTypes.bool,
  precision: PropTypes.number,
  maxDigits: PropTypes.number,
  prefix: PropTypes.string,
}

Units.defaultProps = {
  ...Expandable.defaultProps,
  symbol: '',
  showSymbol: true,
  precision: 4,
  maxDigits: 10,
  prefix: '',
}

export default Units
