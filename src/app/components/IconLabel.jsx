import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'class-names'

import { tag as tagPropType } from 'Utilities/propTypes'

import Icon from 'Components/Icon'

const IconLabel = ({ tag: Tag, className, icon, label }) => (
  <Tag className={classNames('text-muted', className)}>
    {icon && (<Icon height='1.25em' width='1.25em' src={icon} inline tag='span' className='mr-2'/>)}
    {label}
  </Tag>
)

IconLabel.propTypes = {
  label: PropTypes.node.isRequired,
  icon: PropTypes.oneOfType([PropTypes.bool, tagPropType]),
  tag: tagPropType,
}

IconLabel.defaultProps = {
  icon: false,
  tag: 'small'
}

export default IconLabel