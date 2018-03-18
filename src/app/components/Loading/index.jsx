import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'class-names'
import styles from './style'

import faastLogo from 'Img/faast-logo.png'

const Loading = ({ error, center }) => (
  <div className={classNames(styles.loading, { 'm-auto': center })}>
    <img src={faastLogo} height='50' />
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
