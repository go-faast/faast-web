import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import BigNumber from 'bignumber.js'
import { omit } from 'lodash'

import { toBigNumber, abbreviateNumber } from 'Utilities/convert'
import { numberish } from 'Utilities/propTypes'
import Expandable from 'Components/Expandable'
import CoinIcon from 'Components/CoinIcon'

class Units extends React.Component {
  render() {
    const {
      value: propValue, symbol, showSymbol, prefixSymbol, showIcon, iconProps,
      precision, abbreviate, maxDigits, prefix, suffix, roundingMode, roundingType, 
      expand, symbolSpaced, includeTrailingZeros, ...props
    } = this.props
    let value = toBigNumber(propValue)
    let expanded = value.toFormat()
    let shrunk = expanded
    let abbrevSuffix
    let space = symbolSpaced ? ' ' : ''
    if (abbreviate) {
      const abbreviated = abbreviateNumber(value, precision)
      shrunk = abbreviated.value
      abbrevSuffix = abbreviated.suffix
      value = abbreviated.value
    }
    if (precision) {
      shrunk = roundingType === 'dp'
        ? (!includeTrailingZeros && value.decimalPlaces() < precision
          ? value.toFormat()
          : value.toFormat(precision, roundingMode))
        : value.toDigits(precision, roundingMode).toFormat()
      const digitCount = shrunk.replace(/\D/g, '').length
      if (maxDigits && digitCount > maxDigits) {
        shrunk = value.toExponential(precision)
      }
    }
    if (abbrevSuffix) {
      shrunk = `${shrunk}${abbrevSuffix}`
    }
    if (symbol) {
      // Expanded form should always include symbol
      expanded = prefixSymbol ? `${symbol}${space}${expanded}` : `${expanded}${space}${symbol}`
      if (showSymbol) {
        shrunk = prefixSymbol ? `${symbol}${space}${shrunk}` : `${shrunk}${space}${symbol}`
      }
    }
    const expandable = expand ? (<Expandable shrunk={shrunk} expanded={expanded} {...props}/>) : <span {...props}>{shrunk}</span>
    return (<Fragment>
      {prefix}{showIcon && (
        <Fragment>
          <CoinIcon symbol={symbol} size='sm' inline style={{ verticalAlign: 'baseline' }} {...iconProps}/>
          {' '}
        </Fragment>
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
  abbreviate: PropTypes.bool, // abbreviate long numbers ex: 10.15B
  roundingMode: PropTypes.oneOf([
    BigNumber.ROUND_UP, BigNumber.ROUND_DOWN, BigNumber.ROUND_CEIL, BigNumber.ROUND_FLOOR,
    BigNumber.ROUND_HALF_UP, BigNumber.ROUND_HALF_DOWN, BigNumber.ROUND_HALF_EVEN,
    BigNumber.ROUND_HALF_CEIL, BigNumber.ROUND_HALF_FLOOR
  ]),
  roundingType: PropTypes.oneOf([
    'dp', // Round to 'precision' decimal places
    'sd', // Round to 'precision' significant digits
  ]),
  iconProps: PropTypes.object,
  symbolSpaced: PropTypes.bool,
  expand: PropTypes.bool
}

Units.defaultProps = {
  ...Expandable.defaultProps,
  symbol: '',
  showSymbol: true,
  showIcon: false,
  prefixSymbol: false,
  abbreviate: false,
  precision: 4,
  maxDigits: null,
  prefix: null,
  suffix: null,
  roundingMode: BigNumber.ROUND_HALF_UP,
  roundingType: 'sd',
  iconProps: {},
  symbolSpaced: true,
  expand: true,
  includeTrailingZeros: false,
}

export default Units
