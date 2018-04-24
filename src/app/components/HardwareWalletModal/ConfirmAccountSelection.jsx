import React from 'react'
import PropTypes from 'Utilities/propTypes'
import { Row, Col, Button, Card } from 'reactstrap'

import Units from 'Components/Units'
import Spinner from 'Components/Spinner'
import AddressLink from 'Components/AddressLink'

const ConfirmAccountSelection = ({ account: { index, id, balance }, toggleAccountSelect }) => (
  <Row className='gutter-3 justify-content-center'>
    <Col xs='auto'>
      <Card body color='ultra-dark' className='text-left flat'>
        <h5>Account #{index + 1}
          <span className='float-right text-muted ml-3'>
            {typeof balance !== 'undefined'
              ? (<Units value={balance} symbol='ETH'/>)
              : (<Spinner inline size='sm'/>)}
          </span>
        </h5>
        {id && (<AddressLink address={id} className='mt-2'/>)}
      </Card>
    </Col>
    <div className='w-100'/>
    <Col xs='auto'>
      <Button color='primary' onClick={toggleAccountSelect}>Change account</Button>
    </Col>
  </Row>
)

ConfirmAccountSelection.propTypes = {
  account: PropTypes.object.isRequired,
  toggleAccountSelect: PropTypes.func.isRequired,
}

export default ConfirmAccountSelection
