import React from 'react'
import PropTypes from 'prop-types'
import BigNumber from 'bignumber.js'
import { omit } from 'lodash'

import { toBigNumber } from 'Utilities/convert'
import { tag as tagPropType, numberish } from 'Utilities/propTypes'
import Expandable from 'Components/Expandable'

class Units extends React.Component {
  render() {
    const {
      tag: Tag, value: propValue, symbol, showSymbol, prefixSymbol,
      precision, maxDigits, prefix, suffix, ...props
    } = this.props
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
      // Expanded form should always include symbol
      expanded = prefixSymbol ? `${symbol} ${expanded}` : `${expanded} ${symbol}`
      if (showSymbol) {
        shrunk = prefixSymbol ? `${symbol} ${shrunk}` : `${shrunk} ${symbol}`
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
  tag: tagPropType, // Component or HTML tag to wrap the value in
  value: numberish.isRequired, // Value of the unit
  symbol: PropTypes.string, // Symbol to show next to value
  showSymbol: PropTypes.bool, // True if symbol should be shown
  prefixSymbol: PropTypes.bool, // True if symbol should be shown before value rather than after
  precision: PropTypes.number, // Maximum number of significant digits to show. Null to use maximum precision.
  maxDigits: PropTypes.number, // Maximum number of digits allowed (including zeros) before using exponential form
  prefix: PropTypes.node, // Arbitrary node to place before the unit
  suffix: PropTypes.node, // Arbitrary node to palce after the unit
}

Units.defaultProps = {
  ...Expandable.defaultProps,
  tag: 'span',
  symbol: '',
  showSymbol: true,
  prefixSymbol: false,
  precision: 4,
  maxDigits: 10,
  prefix: '',
  suffix: '',
}

export default Units
