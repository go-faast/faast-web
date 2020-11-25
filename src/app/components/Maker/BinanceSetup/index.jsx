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

import { card, cardHeader, smallCard } from '../style'

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
              <Col>
                <h2>Enable 2FA and verify yourself</h2>
                <div>
                  <img src={BinanceSetup1} />
                </div>
              </Col>
              <Col>
                <h2>Turn on Anti-phishing code</h2>
                <div>
                  <img src={BinanceSetup2} />
                  <img src={BinanceSetup3} />
                </div>
              </Col>
              <Col>
                <h2>API Key Setup</h2>
                <div>
                  <img src={BinanceSetup4} />
                  <p>Below is a shot of the API restrictions form. You'll want to check those checkboxes and hit "Restriction access to trusted IPs only", set your server's IP address (click Confirm), and then hit the Save button in the top right of the form.</p>
                  <img src={BinanceSetup5} />
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