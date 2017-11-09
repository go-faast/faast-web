import React from 'react'
import PropTypes from 'prop-types'
import { Route } from 'react-router-dom'
import AppController from 'Controllers/AppController'
import LoadingController from 'Controllers/LoadingController'
import styles from 'Styles/Entry.scss'

const Entry = (props) => {
  return (
    <div className={styles.container}>
      <div className={`container-fluid ${styles.content}`}>
        {props.ready && <Route component={AppController} />}
        {props.loading && <LoadingController />}
      </div>
    </div>
  )
}

Entry.propTypes = {
  ready: PropTypes.bool
}

export default Entry
