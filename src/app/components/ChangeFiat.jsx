import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'class-names'

import Units from 'Components/Units'

import { ZERO, BigNumber } from 'Utilities/convert'

const ChangeFiat = ({ className, children: change }) => (
  <Units 
    className={classNames(className, change.isNegative() ?
      'text-negative' : change > 0 ? 'text-positive' : null)}
    value={change}
    symbolSpaced={false}
    symbol='$'
    prefixSymbol
    expand={false}
  >
  </Units>
)

ChangeFiat.propTypes = {
  children: PropTypes.instanceOf(BigNumber)
}

ChangeFiat.defaultProps = {
  children: ZERO
}

export default ChangeFiat