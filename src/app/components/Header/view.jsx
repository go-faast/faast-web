import React from 'react'
import PropTypes from 'prop-types'
import Sticky from 'react-stickynode'
import { reduxForm, Field } from 'redux-form'
import { InputGroup, InputGroupAddon, Input, Button } from 'reactstrap'
import styles from './style'
import { Row, Col } from 'reactstrap'
import { zIndexSticky } from 'faast-ui'

let AddressSearchForm = (props) => (
  <form onSubmit={props.handleSubmit} className='w-100'>
    <div className='form-group'>
      <InputGroup>
        <Input
          tag={Field}
          component='input'
          name='address'
          type='text'
          autoCorrect={false}
          autoCapitalize={false}
          spellCheck={false}
          placeholder='Search by address...'
        />
        <InputGroupAddon addonType="append">
          <Button color='faast' size='lg' outline type='submit'><i className='fa fa-search fa'></i></Button>
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
    <Sticky enabled={!!stickyHeader} innerZ={zIndexSticky}>
      <div id='header' className={styles.header}>
        <div>
          <Row className='gutter-3'>
            <Col xs='12' md='6'>
              <h2 className='text-primary'>faast Portfolio <sup className='beta-tag'>beta</sup></h2>
              <h4 className='text-grey'>manage your crypto assets collection with faast portfolio</h4>
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
