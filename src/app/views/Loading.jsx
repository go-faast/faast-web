import React from 'react'
import styles from 'Styles/Loading.scss'

const Loading = (props) => (
  <div>
    <div className={styles.background} />
    <div className={styles.loadingContainer}>
      <div className={styles.loadingInnerContainer}>
        <div className={styles.loading}>
          <img src='https://faa.st/img/faast-transparent-bad.png' height='50' />
          {props.showSpinner &&
            <span className={styles.spinnerContainer}>
              <div className='faast-loading loading-large' />
            </span>
          }
        </div>
      </div>
    </div>
  </div>
)

export default Loading
