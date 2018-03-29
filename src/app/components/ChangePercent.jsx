import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'class-names'

import { tag as tagPropType } from 'Utilities/propTypes'
import { ZERO, BigNumber } from 'Utilities/convert'
import display from 'Utilities/display'

const ChangePercent = ({ tag: Tag, className, children: change }) => (
  <Tag className={classNames(className, change.isNegative() ? 'text-negative' : 'text-positive')}>
    {display.percentage(change, true)}
  </Tag>
)

ChangePercent.propTypes = {
  tag: tagPropType,
  children: PropTypes.instanceOf(BigNumber)
}

ChangePercent.defaultProps = {
  tag: 'span',
  children: ZERO
}

export default ChangePercent