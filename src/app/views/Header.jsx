import React from 'react'
import PropTypes from 'prop-types'
import Sticky from 'react-stickynode'
import { Link } from 'react-router-dom'
import { reduxForm, Field } from 'redux-form'
import { InputGroup, InputGroupButton } from 'reactstrap'
import { addKeys } from 'Utilities/reactFuncs'
import styles from 'Styles/Header.scss'
import config from 'Config'

let AddressSearchForm = (props) => (
  <form onSubmit={props.handleSubmit} className={styles.searchForm}>
    <div className='form-group'>
      <InputGroup>
        <Field
          name='address'
          component='input'
          className={styles.searchInput}
          type='text'
          autoCorrect={false}
          autoCapitalize={false}
          spellCheck={false}
          placeholder='view by address'
        />
        <InputGroupButton>
          <button type='submit' className='button-container button-outline cursor-pointer' style={{ width: 'inherit' }}>go</button>
        </InputGroupButton>
      </InputGroup>
    </div>
  </form>
)

AddressSearchForm = reduxForm({
  form: 'addressSearchForm'
})(AddressSearchForm)

const Header = (props) => {
  const renderActions = () => {
    switch (props.view) {
      case 'balances':
        const balanceStyles = props.disableAction ? `${styles.actions} ${styles.disabled}` : styles.actions
        return (<div>
          <div disabled={props.disableAction} onClick={props.handleModify} className={balanceStyles}>
            modify your portfolio
          </div>
          <div onClick={props.handleCloseWallet} className='button-container button-small button-outline cursor-pointer margin-top-15 pull-right margin-right-20'>close</div>
        </div>)
      case 'view':
        return addKeys([
          <div>
            {(props.isWalletAccessed &&
              <Link to='/balances'>
                <div className='button-container button-small cursor-pointer margin-top-15 pull-right'>back to wallet</div>
              </Link>) ||
              <Link to='/'>
                <div className='button-container button-small cursor-pointer margin-top-15 pull-right'>access wallet</div>
              </Link>
            }
          </div>
        ])
      case 'modify':
        return (<div>
          <div onClick={props.handleSave} className='button-container button-small cursor-pointer margin-top-15 pull-right'>save</div>
          <div onClick={props.handleCancel} className='button-container button-small button-outline cursor-pointer margin-top-15 pull-right margin-right-20'>
            cancel
          </div>
        </div>)
    }
  }
  const containerClass = props.showAction ? `row ${styles.container}` : `row ${styles.container} ${styles.noAction}`
  return (
    <Sticky enabled={!!props.stickyHeader} innerZ={config.sticky.zIndex}>
      <div id='header' className={containerClass}>
        <div className='col-md-6'>
          <div className={styles.headerTitle}>faast Portfolio <sup className='text-medium-grey beta-tag'>beta</sup></div>
          <div className={styles.headerDesc}>manage your crypto assets collection with faast portfolio</div>
        </div>
        <div className='col-md-6 padding-right-0' style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          {props.showAddressSearch && <AddressSearchForm onSubmit={props.handleAddressSearch} />}
          {props.showAction && renderActions()}
        </div>
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
