import React from 'react'
import PropTypes from 'prop-types'
import BigNumber from 'bignumber.js'
import { toBigNumber } from 'Utilities/convert'
import Expandable from 'Components/Expandable'

const numberType = PropTypes.oneOfType([PropTypes.number, PropTypes.instanceOf(BigNumber)])

class Units extends React.Component {
  render() {
    const { symbol, showSymbol, maxPrecision } = this.props
    const value = toBigNumber(this.props.value)
    let expanded = value.toFormat()
    let shrunk = value.toDigits(maxPrecision, BigNumber.ROUND_DOWN).toFormat()
    if (symbol) {
      expanded = `${expanded} ${symbol}` // Expanded form should always include symbol
      if (showSymbol) {
        shrunk = `${shrunk} ${symbol}`
      }
    }
    return (<Expandable shrunk={shrunk} expanded={expanded}/>)
  }
}

Units.propTypes = {
  value: numberType.isRequired,
  symbol: PropTypes.string,
  showSymbol: PropTypes.bool,
  maxPrecision: PropTypes.number,
}

Units.defaultProps = {
  symbol: '',
  showSymbol: true,
  maxPrecision: 4,
}

export default Units