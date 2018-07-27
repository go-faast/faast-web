import React from 'react'
import { Link } from 'react-router-dom'
import {
  Row, Col, Button,
} from 'reactstrap'

import routes from 'Routes'
import Layout from 'Components/Layout'
import BlockstackWelcome from 'Components/BlockstackWelcome'
import WalletSelector from 'Components/WalletSelector'
import OrderStatus from 'Components/OrderStatus'
import Balances from 'Components/Balances'
import ModalRoute from 'Components/ModalRoute'

import ShareModal from './ShareModal'
import log from 'Log'
const DashboardView = (props) => {
  const {
    wallet, viewOnly, toggleChart, openCharts,
    showOrderStatus, disableRemove, handleRemove, isDefaultPortfolioEmpty
  } = props

  const { label, type, address } = wallet
  const isPortfolio = type === 'MultiWallet'

  return (
    <Layout className='pt-3'>
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
                  <Button tag={Link} color='light' size='sm' to={routes.dashboardShare()} disabled={!address}>
                    <i className='fa fa-share'/> share
                  </Button>
                </Col>
                <Col xs='auto'>
                  <Button color='danger' size='sm' onClick={handleRemove} disabled={disableRemove}>
                    <i className='fa fa-times'/> remove {isPortfolio ? 'portfolio' : 'wallet'}
                  </Button>
                </Col>
              </Row>
            </Col>
            {showOrderStatus && (
              <Col xs='12'>
                <OrderStatus/>
              </Col>
            )}
            <Col xs='12'>
              <Balances wallet={wallet} toggleChart={toggleChart} openCharts={openCharts}/>
            </Col>
          </Row>
        </Col>
      </Row>
      <ModalRoute
        path={routes.dashboardShare.path}
        closePath={routes.dashboard.path}
        render={(renderProps) => (
          <ShareModal wallet={wallet} {...renderProps}/>
        )}
      />
    </Layout>
  )
}

export default DashboardView
