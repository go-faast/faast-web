import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'class-names'
import style from './style'

const Overlay = ({ tag: Tag, children, className, ...props }) => (
  <Tag className={classNames(style.overlay, className)} {...props}>
    {children}
  </Tag>
)

Overlay.propTypes = {
  tag: PropTypes.oneOfType([PropTypes.string, PropTypes.func])
}

Overlay.defaultProps = {
  tag: 'div'
}

export default Overlay