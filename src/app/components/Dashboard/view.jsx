import React from 'react'
import {
  Row, Col, Card, CardHeader, CardBody, Nav, NavItem, NavLink,
  UncontrolledDropdown, DropdownMenu, DropdownToggle, DropdownItem,
} from 'reactstrap'
import { NavLink as RouterNavLink } from 'react-router-dom'

import { defaultPortfolioId } from 'Actions/portfolio'
import routes from 'Routes'

import Layout from 'Components/Layout'
import Balances from 'Components/Balances'
import Sidebar from 'Components/Sidebar'
import WalletSelector from 'Components/WalletSelector'
import Address from 'Components/Address'
import PieChart from 'Components/PieChart'
import SwapList from 'Components/SwapList'
import ShareButton from 'Components/ShareButton'
import WalletStats from 'Components/WalletStats'

const DashboardView = (props) => {
  const {
    wallet, toggleChart, openCharts, handleRemove, isDefaultPortfolioEmpty,
    recentSwaps
  } = props

  return (
    <Layout className='pt-3'>
      <Row className='gutter-3'>
        <Col xs='12'>
          <Nav>
            <NavItem className='ml-auto'>
              <NavLink tag={RouterNavLink} to={routes.dashboard()}><i className='fa fa-list'/> Dashboard</NavLink>
            </NavItem>
            <NavItem>
              <NavLink tag={RouterNavLink} to={routes.rebalance()}><i className='fa fa-sliders'/> Rebalance</NavLink>
            </NavItem>
            <NavItem>
              <NavLink tag={RouterNavLink} to={routes.tradeHistory()}><i className='fa fa-history'/> Orders</NavLink>
            </NavItem>
            <NavItem>
              <NavLink tag={RouterNavLink} to={routes.connect()}><i className='fa fa-plus'/> Add Wallet</NavLink>
            </NavItem>
          </Nav>
        </Col>
        {!isDefaultPortfolioEmpty && (
          <Col xs='12' md='5' lg='4' xl='3'>
            <Sidebar className='d-none d-md-block'/>
            <WalletSelector className='d-flex d-md-none'/>
          </Col>
        )}
        <Col xs='12' md='7' lg='8' xl='9'>
          <Row className='gutter-3'>
            <Col xs='12'>
              <Card>
                <CardHeader>
                  <Row className='gutter-3 align-items-center'>
                    <Col className='px-2'>
                      <h5>{wallet.label}</h5>
                    </Col>
                    <Col xs='auto'>
                      <ShareButton wallet={wallet} className='py-0 align-baseline'/>
                    </Col>
                    <Col className='p-0 pr-2' xs='auto'>
                      <UncontrolledDropdown group size='sm'>
                        <DropdownToggle
                          className='py-0 px-2 text-white'
                          color='link'
                        >
                          <i className="fa fa-ellipsis-v fa-lg" aria-hidden="true"></i>
                        </DropdownToggle>
                        <DropdownMenu className='p-0' right>
                          <DropdownItem className='py-2' onClick={handleRemove}>
                            {wallet.id === defaultPortfolioId ? 'Remove all wallets' : 'Remove Wallet'}
                          </DropdownItem>
                        </DropdownMenu>
                      </UncontrolledDropdown>
                    </Col>
                  </Row>
                </CardHeader>
                <WalletStats tag={CardBody} wallet={wallet}/>
              </Card>
            </Col>
            <Col xs='12'>
              <Balances 
                wallet={wallet} 
                toggleChart={toggleChart} 
                openCharts={openCharts}
                handleRemove={handleRemove}
              />
            </Col>
            <Col xs='12' xl='6'>
              <SwapList
                className='h-100'
                header={'Recent Swaps'}
                swaps={recentSwaps}/>
            </Col>
            <Col xs='12' xl='6'>
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
