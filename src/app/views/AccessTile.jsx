import React from 'react'
import styles from 'Styles/AccessTile.scss'

const AccessTile = (props) => {
  return (
    <div onClick={props.handleClick} className={styles.tileContainer}>
      <div className={`text-uppercase ${styles.header}`}>Access With</div>
      <div className={styles.name}>
        {props.name}
      </div>
    </div>
  )
}

export default AccessTile
