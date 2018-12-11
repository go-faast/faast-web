import React from 'react'
import {
  Row, Col, Card, CardHeader, CardBody,
} from 'reactstrap'

import Layout from 'Components/Layout'
import Balances from 'Components/Balances'
import Sidebar from 'Components/Sidebar'
import WalletSelector from 'Components/WalletSelector'
import Address from 'Components/Address'
import PieChart from 'Components/PieChart'
import SwapList from 'Components/SwapList'

const DashboardView = (props) => {
  const {
    wallet, toggleChart, openCharts, handleRemove, isDefaultPortfolioEmpty,
    recentSwaps
  } = props

  return (
    <Layout className='pt-3'>
      <Row className='gutter-3'>
        {!isDefaultPortfolioEmpty && (
          <Col xs='12' md='5' lg='4' xl='3'>
            <Sidebar className='d-none d-md-block'/>
            <WalletSelector className='d-flex d-md-none'/>
          </Col>
        )}
        <Col xs='12' md='7' lg='8' xl='9'>
          <Row className='gutter-3'>
            <Col xs='12'>
              <Balances 
                wallet={wallet} 
                toggleChart={toggleChart} 
                openCharts={openCharts}
                handleRemove={handleRemove}
              />
            </Col>
            <Col xs='12' lg='6'>
              <SwapList
                className='h-100'
                header={'Recent Swaps'}
                swaps={recentSwaps}/>
            </Col>
            <Col xs='12' lg='6'>
              <Card>
                <CardHeader>
                  <h5>Distribution</h5>
                </CardHeader>
                <CardBody>
                  {wallet.address && (
                    <div className='text-right' style={{ lineHeight: 1 }}>
                      <Address address={wallet.address} />
                      <small className='text-muted'>address</small>
                    </div>
                  )}
                  <PieChart portfolio={wallet} />
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>
    </Layout>
  )
}

export default DashboardView
