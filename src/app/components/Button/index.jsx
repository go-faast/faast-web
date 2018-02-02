import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'class-names'
import style from './style'

const Button = ({ small, outline, disabled, className, children, ...extraProps }) => (
  <button className={classNames(
    className,
    'button-container', {
      'button-small': small,
      'button-outline': outline,
      'cursor-pointer': !disabled,
      [style.disabled]: disabled
    })}
    {...extraProps}>
    {children}
  </button>)

Button.propTypes = {
  outline: PropTypes.bool,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  children: PropTypes.any
}

Button.defaultProps = {
  outline: false,
  disabled: false,
  className: '',
  children: ''
}

export default Button