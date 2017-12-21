import React from 'react'
import Header from 'Components/Header'
import styles from './style'

const LayoutView = (props) => {
  return (
    <div className={`container ${styles.container}`}>
      <Header {...props} />
      {props.children}
    </div>
  )
}

export default LayoutView
