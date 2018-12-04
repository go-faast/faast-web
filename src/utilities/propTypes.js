import PropTypes from 'prop-types'
import BigNumber from 'bignumber.js'
import BN from 'bn.js'

export const tag = PropTypes.oneOfType([
  PropTypes.string,
  PropTypes.func,
])

export const numberish = PropTypes.oneOfType([
  PropTypes.string,
  PropTypes.number,
  PropTypes.instanceOf(BigNumber),
  PropTypes.instanceOf(BN),
])

export * from 'prop-types'

export default {
  ...PropTypes,
  tag,
  numberish
}
