/* eslint-disable react/no-unescaped-entities */
import React, { Fragment } from 'react'
import { Card, CardHeader, CardBody, Row, Col } from 'reactstrap'
import { compose, setDisplayName } from 'recompose'
import classNames from 'class-names'

import BinanceSetup1 from 'Img/binancesetup1.png'
import BinanceSetup2 from 'Img/binancesetup2.png'
import BinanceSetup3 from 'Img/binancesetup3.png'
import BinanceSetup4 from 'Img/binancesetup4.png'
import BinanceSetup5 from 'Img/binancesetup5.png'

import MakerLayout from 'Components/Maker/Layout'

import { card, cardHeader, smallCard, text } from '../style'

const BinanceSetup = () => {
  return (
    <Fragment>
      <MakerLayout className='pt-5'>
        <Card className={classNames(card, smallCard, 'mx-auto')}>
          <CardHeader className={classNames(cardHeader, 'text-center')}>
            <span>Binance Setup Details</span>
          </CardHeader>
          <CardBody className={card}>
            <Row>
              <Col xs='12'>
                <h5 className={classNames(text, 'mt-2')}>1) Enable 2FA and verify yourself</h5>
                <div>
                  <img style={{ maxWidth: '100%' }} src={BinanceSetup1} />
                </div>
              </Col>
              <Col xs='12'>
                <h5 className={classNames(text, 'mt-4')}>2) Turn on Anti-phishing code</h5>
                <div>
                  <img style={{ maxWidth: '100%' }} src={BinanceSetup2} />
                  <img style={{ maxWidth: '100%' }} src={BinanceSetup3} />
                </div>
              </Col>
              <Col xs='12'>
                <h5 className={classNames(text, 'mt-4')}>3) API Key Setup</h5>
                <div>
                  <img style={{ maxWidth: '100%', maxHeight: 500 }} src={BinanceSetup4} />
                  <p className={text}>Below is a shot of the API restrictions form. You'll want to check those checkboxes and hit "Restriction access to trusted IPs only", set your server's IP address (click Confirm), and then hit the Save button in the top right of the form.</p>
                  <img style={{ maxWidth: '100%' }} src={BinanceSetup5} />
                </div>
              </Col>
            </Row>
          </CardBody>
        </Card>
      </MakerLayout>
    </Fragment>
  )
}

export default compose(
  setDisplayName('BinanceSetup'),
)(BinanceSetup)