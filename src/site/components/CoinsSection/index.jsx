import React from 'react'
import { compose, setDisplayName } from 'recompose'
import { Row, Col } from 'reactstrap'
import classNames from 'class-names'

import homeStyle from 'Site/pages/Home1/style.scss'

const CoinSection = () => {
  return (
    <Row style={{ marginTop: 0, marginBottom: 150 }} className='p-0 mx-0'>
      <Col className='p-0 pl-3 text-center' xs='12' lg='7'>
        [coin animation here]
      </Col>
      <Col xs='12' lg='5' className='p-0 pl-3 pr-3 align-self-center'>
        <h2 className={classNames(homeStyle.heading, 'mb-3')}>
          Swap over 20+ coins directly <br/> from your wallet
        </h2>
        <p className={homeStyle.description}>
          Unlike centralized exchanges, Faa.st allows you to trade <br/> any coin for any coin - no base pairs. This along with <br/> low fees makes Faa.st the best option for trading your cryptocurrency.
        </p>
        <a className={classNames(homeStyle.link, 'mb-3 d-inline-block')} href='/app/connect'>
          Check out our supported assets <i className='fa fa-arrow-right' />
        </a>
      </Col>
    </Row>
  )}

export default compose(
  setDisplayName('CoinSection'),
)((CoinSection))