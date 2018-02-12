import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'class-names'
import style from './style'

const Button = ({ tag: Tag, small, outline, disabled, className, children, ...extraProps }) => (
  <Tag className={classNames(
    className,
    'btn btn-faast', {
      'btn-sm': small,
      'btn-outline-faast': outline,
      'cursor-pointer': !disabled,
      [style.disabled]: disabled,
      disabled,
    })}
    {...extraProps}>
    {children}
  </Tag>)

Button.propTypes = {
  outline: PropTypes.bool,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  children: PropTypes.any,
  tag: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
}

Button.defaultProps = {
  outline: false,
  disabled: false,
  className: '',
  children: '',
  tag: 'button',
}

export default Button