import React from 'react'
import Units from 'Components/Units'
import { Row, Col, Button, ListGroup } from 'reactstrap'
import Spinner from 'Components/Spinner'
import ListGroupButton from 'Components/ListGroupButton'
import DerivationPathChanger from 'Components/DerivationPathChanger'

const AccountSelect = ({
  accounts, page, startIndex, endIndex, derivationPath, selectIndex, changePage, changePath
}) => (
  <div className='my-3 w-100 text-center'>
    <h5 className='text-primary'>Select an account</h5>
    <ListGroup>
      {accounts.map(({ index, address, balance }) => (
        <ListGroupButton key={address} className='px-3' onClick={() => selectIndex(index)}>
          <Row className='gutter-3 align-items-center justify-content-between'>
            <Col xs='1' className='text-center text-muted'>#{index + 1}</Col>
            <Col>{address}</Col>
            <Col xs='auto'>
              {(typeof balance !== 'undefined' &&
                <Units value={balance} symbol='ETH'/>) ||
                <Spinner size='sm' className='m2-t float-right' />
              }
            </Col>
          </Row>
        </ListGroupButton>
      ))}
    </ListGroup>
    <Row className='gutter-2 justify-content-between align-items-center'>
      <Col xs='3' className='text-left'>
        <Button color='link' onClick={() => changePage(page -1)} disabled={page <= 0}><i className='fa fa-long-arrow-left'/> previous</Button>
      </Col>
      <Col className='text-muted'>
        showing accounts {startIndex + 1} - {endIndex + 1}
      </Col>
      <Col xs='3' className='text-right'>
        <Button color='link' onClick={() => changePage(page + 1)}>next <i className='fa fa-long-arrow-right'/></Button>
      </Col>
    </Row>
    <div className='my-3 w-50 mx-auto'>
      <DerivationPathChanger onChange={changePath} path={derivationPath}/>
    </div>
  </div>
)

export default AccountSelect
