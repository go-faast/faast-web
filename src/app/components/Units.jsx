import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import BigNumber from 'bignumber.js'
import { omit } from 'lodash'

import { toBigNumber } from 'Utilities/convert'
import { numberish } from 'Utilities/propTypes'
import Expandable from 'Components/Expandable'
import CoinIcon from 'Components/CoinIcon'

class Units extends React.Component {
  render() {
    const {
      value: propValue, symbol, showSymbol, prefixSymbol, showIcon,
      precision, maxDigits, prefix, suffix, roundingMode, roundingType, ...props
    } = this.props
    const value = toBigNumber(propValue)
    let expanded = value.toFormat()
    let shrunk = expanded
    if (precision) {
      shrunk = roundingType === 'dp'
        ? value.toFormat(precision, roundingMode)
        : value.toDigits(precision, roundingMode).toFormat()
      const digitCount = shrunk.replace(/\D/g, '').length
      if (maxDigits >= 0 && digitCount > maxDigits) {
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
    const expandable = (<Expandable shrunk={shrunk} expanded={expanded} {...props}/>)
    return (<Fragment>
      {prefix}{showIcon && (
        <Fragment><CoinIcon symbol={symbol} size='sm' inline style={{ verticalAlign: 'baseline' }}/>{' '}</Fragment>
      )}{expandable}{suffix}
    </Fragment>)
  }
}

Units.propTypes = {
  ...omit(Expandable.propTypes, 'shrunk', 'expanded'),
  value: numberish.isRequired, // Value of the unit
  symbol: PropTypes.string, // Symbol to show next to value
  showSymbol: PropTypes.bool, // True if symbol should be shown
  showIcon: PropTypes.bool, // True if asset icon should be shown
  prefixSymbol: PropTypes.bool, // True if symbol should be shown before value rather than after
  precision: PropTypes.number, // Maximum number of significant digits to show. Null to use maximum precision.
  maxDigits: PropTypes.number, // Maximum number of digits allowed (including zeros) before using exponential form
  prefix: PropTypes.node, // Arbitrary node to place before the unit
  suffix: PropTypes.node, // Arbitrary node to palce after the unit
  roundingMode: PropTypes.oneOf([
    BigNumber.ROUND_UP, BigNumber.ROUND_DOWN, BigNumber.ROUND_CEIL, BigNumber.ROUND_FLOOR,
    BigNumber.ROUND_HALF_UP, BigNumber.ROUND_HALF_DOWN, BigNumber.ROUND_HALF_EVEN,
    BigNumber.ROUND_HALF_CEIL, BigNumber.ROUND_HALF_FLOOR
  ]),
  roundingType: PropTypes.oneOf([
    'dp', // Round to 'precision' decimal places
    'sd', // Round to 'precision' significant digits
  ])
}

Units.defaultProps = {
  ...Expandable.defaultProps,
  symbol: '',
  showSymbol: true,
  showIcon: false,
  prefixSymbol: false,
  precision: 4,
  maxDigits: -1,
  prefix: null,
  suffix: null,
  roundingMode: BigNumber.ROUND_HALF_UP,
  roundingType: 'sd'
}

export default Units
