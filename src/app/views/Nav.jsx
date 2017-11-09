import React from 'react'
import styles from 'Styles/Nav.scss'

const Nav = (props) => (
  <div className={`row ${styles.navRow}`}>
    <div className='col-2'>
      {props.showBackButton &&
        <button onClick={props.handleBack} className='btn btn-sm text-center portfolio-button' type='button'><i className='fa fa-chevron-left' /></button>
      }
    </div>
    <div className='col-2 offset-8'>
      <button onClick={props.closeWallet} className='btn btn-sm text-center portfolio-button' type='button'><i className='fa fa-times' /></button>
    </div>
  </div>
)

export default Nav
