import PropTypes from 'prop-types'

import { BigNumber } from 'Utilities/convert'

export const tag = PropTypes.oneOfType([PropTypes.string, PropTypes.func])

export const bigNumber = PropTypes.oneOfType([PropTypes.number, PropTypes.instanceOf(BigNumber)])

export * from 'prop-types'

export default {
  ...PropTypes,
  tag,
  bigNumber
}