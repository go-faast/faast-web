import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'class-names'

import { tag as tagPropType } from 'Utilities/propTypes'

import Icon from 'Components/Icon'

const IconLabel = ({ tag: Tag, className, iconProps, label }) => (
  <Tag className={classNames('text-muted', className)}>
    {iconProps && iconProps.src && (<Icon height='1.25em' width='1.25em' {...iconProps} inline tag='span' className='mr-2'/>)}
    {label}
  </Tag>
)

IconLabel.propTypes = {
  label: PropTypes.node.isRequired,
  iconProps: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),
  tag: tagPropType,
}

IconLabel.defaultProps = {
  iconProps: false,
  tag: 'small'
}

export default IconLabel