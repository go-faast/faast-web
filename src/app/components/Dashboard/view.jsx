import React from 'react'
import {
  Row, Col, Button,
} from 'reactstrap'

import Layout from 'Components/Layout'
import BlockstackWelcome from 'Components/BlockstackWelcome'
import Balances from 'Components/Balances'
import ShareButton from 'Components/ShareButton'
import Sidebar from 'Components/Sidebar'
import WalleSelector from 'Components/WalletSelector'
import TradeTable from 'Components/TradeTable'
import { tableHeadings } from 'Components/TradeHistory'

const DashboardView = (props) => {
  const {
    wallet, viewOnly, toggleChart, openCharts, disableRemove, handleRemove, isDefaultPortfolioEmpty,
    pendingSwaps
  } = props

  const { label, type } = wallet
  const isPortfolio = type === 'MultiWallet'

  return (
    <Layout className='pt-3'>
      {!viewOnly &&
        <BlockstackWelcome />
      }
      <Row className='gutter-3'>
        {!isDefaultPortfolioEmpty && (
          <Col className='mt-2' xs='12' md='5' lg='4' xl='3'>
            <Sidebar className='d-none d-md-block'/>
            <WalleSelector className='d-flex d-md-none'/>
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
                  <ShareButton wallet={wallet}/>
                </Col>
                <Col xs='auto'>
                  <Button color='danger' size='sm' onClick={handleRemove} disabled={disableRemove}>
                    <i className='fa fa-times'/> remove {isPortfolio ? 'portfolio' : 'wallet'}
                  </Button>
                </Col>
              </Row>
            </Col>
            <Col xs='12'>
              <Balances wallet={wallet} toggleChart={toggleChart} openCharts={openCharts}/>
            </Col>
            <Col xs='12'>
              <TradeTable 
                tableTitle='Open Orders'
                swaps={pendingSwaps}
                tableHeadings={tableHeadings}
                hideIfNone
              />
            </Col>
          </Row>
        </Col>
      </Row>
    </Layout>
  )
}

export default DashboardView
