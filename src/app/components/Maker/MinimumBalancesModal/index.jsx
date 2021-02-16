import React, { Fragment } from 'react'
import { compose, setDisplayName, setPropTypes } from 'recompose'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import { Modal, ModalBody, ModalHeader, Row, Col } from 'reactstrap'
import { pick } from 'lodash'
import classNames from 'class-names'

import CoinIcon from 'Components/CoinIcon'
import { makerBalanceTargetsArray } from 'Selectors/maker'

import { modalShadow } from './style'
import { cardHeader, text } from '../style'

export default compose(
  setDisplayName('MinimumBalancesModal'),
  setPropTypes({
    ...Modal.propTypes,
  }),
  connect(createStructuredSelector({
    minimumBalances: makerBalanceTargetsArray,
  }), {
  }),
)(({ minimumBalances, toggle, ...props }) => {
  return (
    <Modal
      size='md' toggle={toggle} className={'border-0 mt-6 mx-md-auto'} contentClassName={classNames(cardHeader, modalShadow, 'p-0 border-0 flat')}
      {...pick(props, Object.keys(Modal.propTypes))}>
      <ModalHeader close={<span className='cursor-pointer' onClick={toggle}>close</span>} tag='h4' toggle={toggle} className={cardHeader}>
        Suggested Minimum Balances
      </ModalHeader>
      <ModalBody style={{ maxHeight: 450, overflow: 'scroll' }} className={classNames(cardHeader, 'p-0 p-sm-3')}>
        <Row>
          {minimumBalances.map(({ symbol, minimum }, i) => {
            return (
              <Fragment key={symbol}>
                <Col xs='12'>
                  <CoinIcon symbol={symbol} size='md' /> <span className={classNames(text, 'font-weight-bold ml-1')}>{symbol}  -</span> <span className={text}>{minimum} {symbol}</span>
                </Col>
                {i !== minimumBalances.length - 1 && (
                  <hr className='w-100 border-light'/>
                )}
              </Fragment>
            )
          })}
        </Row>
      </ModalBody>
    </Modal>
  )
})
