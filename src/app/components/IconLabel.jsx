import React from 'react'
import PropTypes from 'prop-types'

import { tag as tagPropType } from 'Utilities/propTypes'

import Icon from 'Components/Icon'

const IconLabel = ({ tag: Tag, iconProps, verticalAlign, suffixIcon, label, ...props }) => {
  const showIcon = Boolean(iconProps && iconProps.src)
  const labelElem = showIcon ? (<span style={{ verticalAlign }}>{label}</span>) : label
  return (
    <Tag {...props}>
      {suffixIcon && labelElem}
      {showIcon && (
        <Icon
          height='1.25em' width='1.25em' {...iconProps}
          inline tag='span' style={{
            [suffixIcon ? 'marginLeft' : 'marginRight']: '0.5em',
            verticalAlign,
          }}/>
      )}
      {!suffixIcon && labelElem}
    </Tag>
  )
}

IconLabel.propTypes = {
  label: PropTypes.node.isRequired,
  iconProps: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),
  suffixIcon: PropTypes.bool,
  tag: tagPropType,
  verticalAlign: PropTypes.string,
}

IconLabel.defaultProps = {
  iconProps: false,
  suffixIcon: false,
  tag: 'small',
  verticalAlign: 'middle',
}

export default IconLabel
