import React, { Fragment } from 'react'
import { compose, setDisplayName, setPropTypes, defaultProps } from 'recompose'
import { Row, Col, Button } from 'reactstrap'
import classNames from 'class-names'

import homeStyle from 'Site/pages/Home1/style.scss'

const CoinSection = () => {
  return (
    <Row className='p-0 m-0 mt-5 pt-5 pb-5'>
      <Col xs='12' lg='5' className='p-0 pr-3 pl-5 align-self-center'>
        <h2 className={classNames(homeStyle.heading, 'mb-3')}>
          Over 70+ supported cryptocurrencies
        </h2>
        <p className={homeStyle.description}>
          Unlike centralized exchanges, Faa.st allows you to trade any coin for any coin - no base pairs. This along with low fees makes Faa.st the best option for trading your cryptocurrency.
        </p>
        <a className={classNames(homeStyle.link, 'mb-3 d-inline-block')} href='/app/connect'>
          Check out our full list of available assets
        </a>
      </Col>
      <Col className='p-0 pl-0 pr-3 text-center' xs='12' lg='7'>
        <p className={homeStyle.description}>Coin image here</p>
      </Col>
    </Row>
  )}

export default compose(
  setDisplayName('CoinSection'),
)((CoinSection))