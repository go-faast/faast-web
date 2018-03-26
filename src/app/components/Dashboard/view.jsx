import React from 'react'
import PropTypes from 'prop-types'
import {
  Row, Col, Button, Alert,
} from 'reactstrap'
import BigNumber from 'bignumber.js'
import { Link } from 'react-router-dom'

import Layout from 'Components/Layout'
import SignTxModal from 'Components/SignTxModal'
import BlockstackWelcome from 'Components/BlockstackWelcome'
import WalletSelector from 'Components/WalletSelector'
import OrderStatus from 'Components/OrderStatus'
import Balances from 'Components/Balances'

const BalancesView = (props) => {
  const {
    wallet, viewOnly, orderStatus, toggleChart, openCharts,
    showOrderModal, handleToggleOrderModal, handleForgetOrder,
    disableRemove, handleRemove, isDefaultPortfolioEmpty
  } = props

  const { label, type } = wallet
  const isPortfolio = type === 'MultiWallet'

  return (
    <Layout className='pt-3'>
      {!viewOnly &&
        <SignTxModal showModal={showOrderModal} toggleModal={handleToggleOrderModal} view='orderStatus' />
      }
      {!viewOnly &&
        <BlockstackWelcome />
      }
      <Row className='gutter-3'>
        {!isDefaultPortfolioEmpty && (
          <Col xs='12' md='5' lg='4' xl='3'>
            <WalletSelector/>
          </Col>
        )}
        <Col xs='12' md='7' lg='8' xl='9'>
          <Row className='gutter-3'>
            {viewOnly ? (
              <Col xs='12' className='text-center'>
                <Alert color='info' className='m-0'>
                  You are viewing a read-only wallet. If this is your address, you need to <Link to='/connect' className='font-weight-normal alert-link'><u>connect your wallet</u></Link> in order to trade assets.
                </Alert>
              </Col>
            ) : (
              <Col xs='12'>
                <Row className='gutter-3 align-items-end'>
                  <Col>
                    <h4 className='m-0 text-primary'>{label}</h4>
                  </Col>
                  <Col xs='auto'>
                    <Button color='danger' size='sm' onClick={handleRemove} disabled={disableRemove}>
                      <i className='fa fa-times'/> remove {isPortfolio ? 'portfolio' : 'wallet'}
                    </Button>
                  </Col>
                </Row>
              </Col>
            )}
            {!viewOnly && Boolean(orderStatus) &&
              <Col xs='12'>
                <OrderStatus status={orderStatus} handleViewStatus={handleToggleOrderModal} handleForgetOrder={handleForgetOrder} />
              </Col>
            }
            <Col xs='12'>
              <Balances wallet={wallet} toggleChart={toggleChart} openCharts={openCharts}/>
            </Col>
          </Row>
        </Col>
      </Row>
    </Layout>
  )
}

BalancesView.propTypes = {
  totalChange: PropTypes.instanceOf(BigNumber),
  totalDecrease: PropTypes.bool,
  total24hAgo: PropTypes.instanceOf(BigNumber),
  total: PropTypes.instanceOf(BigNumber),
  assetRows: PropTypes.array,
  toggleChart: PropTypes.func,
  layoutProps: PropTypes.object,
  pieChart: PropTypes.element
}

export default BalancesView
