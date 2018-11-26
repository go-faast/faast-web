import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'class-names'

import { tag as tagPropType } from 'Utilities/propTypes'
import { ZERO, BigNumber } from 'Utilities/convert'
import display from 'Utilities/display'

const ChangePercent = ({ tag: Tag, className, children: change, parentheses }) => (
  <Tag className={classNames(className, change.isNegative() ? 'text-negative' : change > 0 ? 'text-positive' : null)}>
    {!parentheses ? display.percentage(change, true) : `(${display.percentage(change, true)})`}
  </Tag>
)

ChangePercent.propTypes = {
  tag: tagPropType,
  children: PropTypes.instanceOf(BigNumber),
  parentheses: PropTypes.bool
}

ChangePercent.defaultProps = {
  tag: 'span',
  children: ZERO,
  parentheses: false
}

export default ChangePercent