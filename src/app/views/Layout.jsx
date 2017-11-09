import React from 'react'
import HeaderController from 'Controllers/HeaderController'
import styles from 'Styles/Layout.scss'

const Layout = (props) => {
  return (
    <div className={`container ${styles.container}`}>
      <HeaderController {...props} />
      {props.children}
    </div>
  )
}

export default Layout
