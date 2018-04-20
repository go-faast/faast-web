import React from 'react'
import PropTypes from 'prop-types'
import BigNumber from 'bignumber.js'
import { omit } from 'lodash'

import { toBigNumber } from 'Utilities/convert'
import { tag as tagPropType, numberish } from 'Utilities/propTypes'
import Expandable from 'Components/Expandable'

class Units extends React.Component {
  render() {
    const { tag: Tag, value: propValue, symbol, showSymbol, precision, maxDigits, prefix, suffix, ...props } = this.props
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
    const expandable = (<Expandable tag={Tag} shrunk={shrunk} expanded={expanded} {...props}/>)
    if (prefix || suffix) {
      return (<Tag>{prefix}{expandable}{suffix}</Tag>)
    }
    return expandable
  }
}

Units.propTypes = {
  ...omit(Expandable.propTypes, 'tag', 'shrunk', 'expanded'),
  tag: tagPropType,
  value: numberish.isRequired,
  symbol: PropTypes.string,
  showSymbol: PropTypes.bool,
  precision: PropTypes.number,
  maxDigits: PropTypes.number,
  prefix: PropTypes.node,
  suffix: PropTypes.node,
}

Units.defaultProps = {
  ...Expandable.defaultProps,
  tag: 'span',
  symbol: '',
  showSymbol: true,
  precision: 4,
  maxDigits: 10,
  prefix: '',
  suffix: '',
}

export default Units
