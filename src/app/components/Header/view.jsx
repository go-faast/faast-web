import React from 'react'
import PropTypes from 'prop-types'
import Sticky from 'react-stickynode'
import { Link } from 'react-router-dom'
import { reduxForm, Field } from 'redux-form'
import { InputGroup, InputGroupAddon } from 'reactstrap'
import styles from './style'
import config from 'Config'
import { Row, Col } from 'reactstrap'
import Button from 'Components/Button'
import SelectPortfolioDropdown from 'Components/SelectPortfolioDropdown'

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
        <InputGroupAddon addonType="append">
          <Button outline type='submit'>go</Button>
        </InputGroupAddon>
      </InputGroup>
    </div>
  </form>
)

AddressSearchForm = reduxForm({
  form: 'addressSearchForm'
})(AddressSearchForm)

const HeaderView = (props) => {
  const {
    view, disableAction, showAction, isPortfolioEmpty, stickyHeader, showAddressSearch,
    handleCloseWallet, handleModify, handleCancel, handleSave, handleAddressSearch
  } = props
  const renderActions = () => (
    <Row className='medium-gutters justify-content-between justify-content-md-end'>
      {view === 'balances' && ([
        <Col key='modify' xs='auto'>
          <Button onClick={handleModify} disabled={disableAction}>modify</Button>
        </Col>
      ])}
      {view === 'view' && (
        <Col xs='auto'>
          {!isPortfolioEmpty
            ? (<Button tag={Link} to='/balances'>back to wallet</Button>)
            : (<Button tag={Link} to='/'>access wallet</Button>)
          }
        </Col>
      )}
      {view === 'modify' && ([
        <Col key='cancel' xs='auto'>
          <Button outline onClick={handleCancel}>cancel</Button>
        </Col>,
        <Col key='save' xs='auto'>
          <Button onClick={handleSave}>save</Button>
        </Col>
      ])}
      {view === 'connect' && ([
        <Col key='balances' xs='auto'>
          <Button tag={Link} to ='/balances'>portfolio</Button>
        </Col>
      ])}
    </Row>)
  return (
    <Sticky enabled={!!stickyHeader} innerZ={config.sticky.zIndex}>
      <div id='header' className={styles.header}>
        <div>
          <Row className='medium-gutters'>
            <Col xs='12' md='6'>
              <div className={styles.headerTitle}>faast Portfolio <sup className='text-medium-grey beta-tag'>beta</sup></div>
              <div className={styles.headerDesc}>manage your crypto assets collection with faast portfolio</div>
            </Col>
            <Col xs='12' md='6'>
              {showAddressSearch && <AddressSearchForm onSubmit={handleAddressSearch} />}
            </Col>
          </Row>
          {showAction && renderActions()}
        </div>
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
  handleCancel: PropTypes.func,
  isPortfolioEmpty: PropTypes.bool
}

HeaderView.defaultProps = {
  showAction: true
}

export default HeaderView
