import React from 'react'
import PropTypes from 'prop-types'
import Sticky from 'react-stickynode'
import { addKeys } from 'Utilities/reactFuncs'
import styles from 'Styles/Header.scss'
import config from 'Config'

const Header = (props) => {
  const renderActions = () => {
    switch (props.view) {
      case 'balances':
        const balanceStyles = props.disableAction ? `${styles.actions} ${styles.disabled}` : styles.actions
        return addKeys([
          <div disabled={props.disableAction} onClick={props.handleModify} className={balanceStyles}>
            modify your portfolio
          </div>,
          <div onClick={props.handleCloseWallet} className='button-container button-small button-outline cursor-pointer margin-top-15 pull-right margin-right-20'>close</div>
        ])
      case 'modify':
        return addKeys([
          <div onClick={props.handleSave} className='button-container button-small cursor-pointer margin-top-15 pull-right'>save</div>,
          <div onClick={props.handleCancel} className='button-container button-small button-outline cursor-pointer margin-top-15 pull-right margin-right-20'>
            cancel
          </div>
        ])
    }
  }
  const containerClass = props.showAction ? `row ${styles.container}` : `row ${styles.container} ${styles.noAction}`
  return (
    <Sticky enabled={!!props.stickyHeader} innerZ={config.sticky.ZIndex}>
      <div id='header' className={containerClass}>
        <div className='col-md-6'>
          <div className={styles.headerTitle}>faast Portfolio <sup className='text-medium-grey beta-tag'>beta</sup></div>
          <div className={styles.headerDesc}>manage your crypto assets collection with faast portfolio</div>
        </div>
        {props.showAction &&
          <div className='col-md-6 padding-right-0'>
            {renderActions()}
          </div>
        }
      </div>
    </Sticky>
  )
}

Header.propTypes = {
  view: PropTypes.string,
  showAction: PropTypes.bool,
  disableAction: PropTypes.bool,
  handleModify: PropTypes.func,
  handleSave: PropTypes.func,
  handleCancel: PropTypes.func
}

export default Header
