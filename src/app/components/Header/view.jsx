import React from 'react'
import PropTypes from 'prop-types'
import Sticky from 'react-stickynode'
import { Link } from 'react-router-dom'
import { reduxForm, Field } from 'redux-form'
import { InputGroup, InputGroupButton } from 'reactstrap'
import styles from './style'
import config from 'Config'
import { Row, Col } from 'reactstrap'
import Button from 'Components/Button'

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
          <Button outline type='submit'>go</Button>
        </InputGroupButton>
      </InputGroup>
    </div>
  </form>
)

AddressSearchForm = reduxForm({
  form: 'addressSearchForm'
})(AddressSearchForm)

const HeaderView = (props) => {
  const { view, disableAction } = props
  const renderActions = () => (
    <Row className='medium-gutters justify-content-between justify-content-md-end'>
      {view === 'balances' && ([
        <Col key='close' xs='auto'>
          <Button outline onClick={props.handleCloseWallet}>close</Button>
        </Col>,
        <Col key='modify' xs='auto'>
          <Button onClick={props.handleModify} disabled={disableAction}>modify</Button>
        </Col>
      ])}
      {view === 'view' && (
        <Col xs='12'>
          {props.isWalletAccessed
            ? (<Link to='/balances'>
                <Button>back to wallet</Button>
              </Link>)
            : (<Link to='/'>
                <Button>access wallet</Button>
              </Link>)
          }
        </Col>
      )}
      {view === 'modify' && ([
        <Col key='cancel' xs='auto'>
          <Button outline onClick={props.handleCancel}>cancel</Button>
        </Col>,
        <Col key='save' xs='auto'>
          <Button onClick={props.handleSave}>save</Button>
        </Col>
      ])}
    </Row>)
  return (
    <Sticky enabled={!!props.stickyHeader} innerZ={config.sticky.zIndex}>
      <div id='header' className={styles.header}>
        <Row className='medium-gutters'>
          <Col xs='12' md='6'>
            <div className={styles.headerTitle}>faast Portfolio <sup className='text-medium-grey beta-tag'>beta</sup></div>
            <div className={styles.headerDesc}>manage your crypto assets collection with faast portfolio</div>
          </Col>
          <Col xs='12' md='6'>
            {props.showAddressSearch && <AddressSearchForm onSubmit={props.handleAddressSearch} />}
          </Col>
        </Row>
        {props.showAction && renderActions()}
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
