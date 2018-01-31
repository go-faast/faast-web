import React from 'react'
import PropTypes from 'prop-types'
import { Route } from 'react-router-dom'
import App from 'Components/App'
import Loading from 'Components/Loading'
import styles from './style'

const EntryView = (props) => {
  return (
    <div className={styles.container}>
      <div className={`container-fluid ${styles.content}`}>
        {props.ready ? (
          <Route component={App} />
        ) : (
          <Loading {...props.loadingProps} />
        )}
      </div>
    </div>
  )
}

EntryView.propTypes = {
  ready: PropTypes.bool
}

export default EntryView
