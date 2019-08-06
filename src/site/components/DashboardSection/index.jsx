/* eslint-disable react/no-unescaped-entities */
import React from 'react'
import { compose, setDisplayName } from 'recompose'
import { Row, Col } from 'reactstrap'
import classNames from 'class-names'

import FaastMockup from 'Img/faast-mockup.svg'

import homeStyle from 'Site/pages/Home1/style.scss'

const DashboardSection = () => {
  return (
    <Row style={{ marginTop: 0, marginBottom: 150 }} className='p-0 mx-0'>
      <Col className='p-0 pl-3 text-center' xs='12' lg='7'>
        <img src={FaastMockup} style={{ width: 480, height: 366 }} />
      </Col>
      <Col xs='12' lg='5' className='p-0 pr-3 pl-3 align-self-center'>
        <h2 className={classNames(homeStyle.heading, 'mb-3')}>
        Portfolio Analytics and Crypto Research Hub
        </h2>
        <p className={homeStyle.description}>
          Connect your wallet and you will be taken to the Faa.st Portfolio Dashboard where you will find your portfolio performance, distribution charts, market cap rankings, trending assets, and your watchlist.
        </p>
        <a className={classNames(homeStyle.link, 'mb-3 d-inline-block')} href='/app/connect'>
          Connect Your Wallet <i className='fa fa-arrow-right' />
        </a>
      </Col>
    </Row>
  )}

export default compose(
  setDisplayName('DashboardSection'),
)((DashboardSection))