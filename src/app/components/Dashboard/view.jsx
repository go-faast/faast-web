import React from 'react'
import {
  Row, Col, Button,
} from 'reactstrap'

import Layout from 'Components/Layout'
import SignTxModal from 'Components/SignTxModal'
import BlockstackWelcome from 'Components/BlockstackWelcome'
import WalletSelector from 'Components/WalletSelector'
import OrderStatus from 'Components/OrderStatus'
import Balances from 'Components/Balances'

const DashboardView = (props) => {
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
            {Boolean(orderStatus) && (
              <Col xs='12'>
                <OrderStatus status={orderStatus} />
              </Col>
            )}
            <Col xs='12'>
              <Balances wallet={wallet} toggleChart={toggleChart} openCharts={openCharts}/>
            </Col>
          </Row>
        </Col>
      </Row>
    </Layout>
  )
}

export default DashboardView
