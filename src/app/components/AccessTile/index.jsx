import React from 'react'
import styles from './style'

const AccessTile = ({ name, icon, handleClick }) => {
  return (
    <button onClick={handleClick} className={styles.accessTile}>
      <div className={`text-uppercase ${styles.header}`}>Access With</div>
      <div className={styles.name}>
        {name}
      </div>
      <img src={icon} className={styles.icon}/>
    </button>
  )
}

export default AccessTile
