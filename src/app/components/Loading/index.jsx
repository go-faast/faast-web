import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'class-names'
import styles from './style'

const Loading = ({ error, center }) => (
  <div className={classNames(styles.loading, { 'm-auto': center })}>
    <img src='https://faa.st/img/faast-transparent-bad.png' height='50' />
    <span className={styles.spinnerContainer}>
      {error
        ? (<span className='text-danger'>{error}</span>)
        : (<div className='faast-loading loading-large' />)}
    </span>
  </div>
)

Loading.propTypes = {
  error: PropTypes.string,
  center: PropTypes.bool,
}

Loading.defaultProps = {
  error: '',
  center: false,
}

export default Loading
