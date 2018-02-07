import React from 'react'
import Loading from 'Components/Loading'
import styles from './style'

const LoadingFullScreen = (props) => (
  <div>
    <div className={styles.background} />
    <div className={styles.loadingContainer}>
      <div className={styles.loadingInnerContainer}>
        <Loading {...props}/>
      </div>
    </div>
  </div>
)

export default LoadingFullScreen
