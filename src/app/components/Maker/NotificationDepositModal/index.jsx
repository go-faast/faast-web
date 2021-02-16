import React from 'react'
import { compose, setDisplayName, setPropTypes, withProps } from 'recompose'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import { Modal, ModalBody, ModalHeader, Row, Col, Input } from 'reactstrap'
import { pick } from 'lodash'
import classNames from 'class-names'
import QRCode from 'Components/DepositQRCode'
import Units from 'Components/Units'

import { getBalanceAlertBySymbol, getTotalBalanceBySymbol } from 'Selectors/maker'

import { modalShadow } from './style'
import { cardHeader, input } from '../style'

const getQuery = ({ match }) => ({
  depositAddress: match.params.address,
  symbol: match.params.symbol
})

export default compose(
  setDisplayName('NotificationDepositModal'),
  setPropTypes({
    ...Modal.propTypes,
  }),
  withProps((props) => {
    const { depositAddress, symbol } = getQuery(props)
    return ({
      depositAddress,
      symbol
    })
  }),
  connect(createStructuredSelector({
    balanceAlert: (state, { symbol }) => getBalanceAlertBySymbol(state, symbol),
  }), {
  }),
  connect(createStructuredSelector({
    balance: (state, { symbol }) => getTotalBalanceBySymbol(state, symbol),
  }), {
  }),
)(({ depositAddress, balanceAlert, balance, balanceAlert: { symbol, alert }, toggle, ...props }) => {
  return (
    <Modal
      size='md' toggle={toggle} className={'border-0 mt-6 mx-md-auto'} contentClassName={classNames(cardHeader, modalShadow, 'p-0 border-0 flat')}
      {...pick(props, Object.keys(Modal.propTypes))}>
      <ModalHeader close={<span className='cursor-pointer' onClick={toggle}>close</span>} tag='h4' toggle={toggle} className={cardHeader}>
        Deposit {symbol}
      </ModalHeader>
      <ModalBody className={classNames(cardHeader, 'p-0 p-sm-3')}>
        <Row>
          <Col sm='12'>
            {balanceAlert ? (
              <div>
                <div className='text-center'>
                  <QRCode address={depositAddress} size={150} />
                </div>
                <Input className={classNames('flat text-center', input)} value={depositAddress} type='text' autoFocus readOnly/>
                <div className='text-center'>
                  
                  <small><p className='text-danger font-weight-bold pl-0 pt-3'>
                    * {alert} and your current balance is: <Units value={balance} symbol={symbol} precision={6} showSymbol showIcon iconProps={{ className: 'd-sm-none' }}/>
                  </p>
                  </small>
                </div>
              </div>
            ) : (
              <p className='text-center'>There is no balance alert associated with this address.</p>
            )} 
          </Col>
        </Row>
      </ModalBody>
    </Modal>
  )
})
