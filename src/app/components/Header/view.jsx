import React from 'react'
import PropTypes from 'prop-types'
import Sticky from 'react-stickynode'
import { Link } from 'react-router-dom'
import { reduxForm, Field } from 'redux-form'
import { InputGroup, InputGroupButton } from 'reactstrap'
import styles from './style'
import config from 'Config'
import { Row, Col } from 'reactstrap'

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

const HeaderView = (props) => {
  const { view } = props
  const renderActions = () => (
    <Row className='medium-gutters justify-content-end'>
      {view === 'balances' && ([
        <Col key='close' xs='auto'>
          <div onClick={props.handleCloseWallet} className='button-container button-small button-outline cursor-pointer'>close</div>
        </Col>,
        <Col key='modify' xs='auto'>
          <div disabled={props.disableAction} onClick={props.handleModify} className={props.disableAction ? `${styles.actions} ${styles.disabled}` : styles.actions}>
            modify your portfolio
          </div>
        </Col>
      ])}
      {view === 'view' && (
        <Col xs='12'>
          {props.isWalletAccessed
            ? (<Link to='/balances'>
                <div className='button-container button-small cursor-pointer'>back to wallet</div>
              </Link>)
            : (<Link to='/'>
                <div className='button-container button-small cursor-pointer'>access wallet</div>
              </Link>)
          }
        </Col>
      )}
      {view === 'modify' && (
        <Col key='cancel' xs='auto'>
          <div onClick={props.handleCancel} className='button-container button-small button-outline cursor-pointer'>cancel</div>
        </Col>,
        <Col key='save' xs='auto'>
          <div onClick={props.handleSave} className='button-container button-small cursor-pointer'>save</div>
        </Col>
      )}
    </Row>)
  return (
    <Sticky enabled={!!props.stickyHeader} innerZ={config.sticky.zIndex}>
      <div id='header'>
        <Row className={`medium-gutters ${styles.container} ${props.showAction ? '' : styles.noAction}`}>
          <Col xs='12' md='6'>
            <div className={styles.headerTitle}>faast Portfolio <sup className='text-medium-grey beta-tag'>beta</sup></div>
            <div className={styles.headerDesc}>manage your crypto assets collection with faast portfolio</div>
          </Col>
          <Col xs='12' md='6'>
            {props.showAddressSearch && <AddressSearchForm onSubmit={props.handleAddressSearch} />}
            {props.showAction && renderActions()}
          </Col>
        </Row>
      </div>
    </Sticky>
  )
}

HeaderView.propTypes = {
  view: PropTypes.string,
  showAction: PropTypes.bool,
  disableAction: PropTypes.bool,
  handleModify: PropTypes.func,
  handleSave: PropTypes.func,
  handleCancel: PropTypes.func
}

export default HeaderView
