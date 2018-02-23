import React from 'react'
import PropTypes from 'prop-types'
import Sticky from 'react-stickynode'
import { reduxForm, Field } from 'redux-form'
import { InputGroup, InputGroupAddon } from 'reactstrap'
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
  const { stickyHeader, showAddressSearch, handleAddressSearch } = props
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
        </div>
      </div>
    </Sticky>
  )
}

HeaderView.propTypes = {
  view: PropTypes.string
}

export default HeaderView
