import React from 'react'
import { compose, setDisplayName, setPropTypes, withProps } from 'recompose'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import { Modal, ModalBody, ModalHeader, Row, Col, Input } from 'reactstrap'
import { pick } from 'lodash'
import classNames from 'class-names'
import QRCode from 'Components/DepositQRCode'
import Units from 'Components/Units'
import { capitalizeFirstLetter } from 'Utilities/helpers'
import { getBalanceBySymbol } from 'Selectors/maker'

import { modalShadow } from './style'
import { cardHeader, input } from '../style'

const getQuery = ({ match }) => ({
  symbol: match.params.symbol,
  address: match.params.address,
  type: match.params.type
})

export default compose(
  setDisplayName('BalanceDepositModal'),
  setPropTypes({
    ...Modal.propTypes,
  }),
  withProps((props) => {
    const depositAddress = getQuery(props).address
    const symbol = getQuery(props).symbol
    const type = getQuery(props).type
    return ({
      depositAddress,
      symbol,
      type
    })
  }),
  connect(createStructuredSelector({
    balance: (state, { symbol }) => getBalanceBySymbol(state, symbol),
  }), {
  }),
)(({ depositAddress, symbol, type, toggle, balance, ...props }) => {
  return (
    <Modal
      size='md' toggle={toggle} className={'border-0 mt-6 mx-md-auto'} contentClassName={classNames(cardHeader, modalShadow, 'p-0 border-0 flat')}
      {...pick(props, Object.keys(Modal.propTypes))}>
      <ModalHeader close={<span className='cursor-pointer' onClick={toggle}>close</span>} tag='h4' toggle={toggle} className={cardHeader}>
        {symbol} {capitalizeFirstLetter(type)} Address
      </ModalHeader>
      <ModalBody className={classNames(cardHeader, 'p-0 p-sm-3')}>
        <Row>
          <Col sm='12'>
            <div>
              <div className='text-center'>
                <QRCode address={depositAddress} size={150} />
              </div>
              <Input className={classNames('flat text-center', input)} value={depositAddress} type='text' autoFocus readOnly/>
              <div style={{ fontWeight: 600 }} className='text-center mt-3'>
                Current Balance: <Units value={balance[type]} symbol={symbol} precision={6} showSymbol showIcon iconProps={{ className: 'd-sm-none' }}/>
              </div>
            </div>
          </Col>
        </Row>
      </ModalBody>
    </Modal>
  )
})
