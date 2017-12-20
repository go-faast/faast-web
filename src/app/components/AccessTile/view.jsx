import React from 'react'
import styles from './style'

const AccessTileView = ({ name, icon, handleClick }) => {
  return (
    <div onClick={handleClick} className={styles.tileContainer}>
      <div className={`text-uppercase ${styles.header}`}>Access With</div>
      <div className={styles.name}>
        {name}
      </div>
      <img src={`/img/${icon}`} className={styles.icon}/>
    </div>
  )
}

export default AccessTileView
