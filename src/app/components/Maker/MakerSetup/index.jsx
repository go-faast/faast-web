/* eslint-disable react/no-unescaped-entities */
import React, { Fragment } from 'react'
import { Helmet } from 'react-helmet'
import { Link } from 'react-router-dom'
import { Card, CardHeader, CardBody, Row, Col } from 'reactstrap'
import { compose, setDisplayName } from 'recompose'
import classNames from 'class-names'
import SignupForm from './form'

import MakerLayout from 'Components/Maker/Layout'

import { card, cardHeader, smallCard } from '../style'

const BinanceSetup = () => {
  return (
    <Fragment>
      <MakerLayout className='pt-5'>
        <Card className={classNames(card, smallCard, 'mx-auto')}>
          <CardHeader className={classNames(cardHeader, 'text-center')}>
            <span>Maker Setup Details</span>
          </CardHeader>
          <CardBody className={card}>
            <Row>
              <Col>
                <h2>1. Create an ubuntu 18.04 server. Cloud hosting is recommended for 24/7 uptime (ie digital ocean, AWS). </h2>
              </Col>
              <Col>
                <h2>2. SSH into your server. Do not user username/password SSH. If you do not know what this means, learn about it <a href='https://www.digitalocean.com/community/tutorials/how-to-configure-ssh-key-based-authentication-on-a-linux-server' target='_blank noreferrer'>here.</a></h2>
                <div>
                  <img />
                </div>
              </Col>
              <Col>
                <h2>3. Run one of the following commands to install.</h2>
                <ul>
                  <li>
                    <code>curl -o- https://raw.githubusercontent.com/go-faast/market-maker-node/master/install.sh | bash</code>
                  </li>
                  <li>
                    <code>wget -qO- https://raw.githubusercontent.com/go-faast/market-maker-node/master/install.sh | bash</code>
                  </li>
                </ul>
              </Col>
              <Col>
                <h2>Note: The following credentials entered will be stored locally only and never sent anywhere.</h2>
                <ul>
                  <li>Exchange Key</li>
                  <li>Exchange secret</li>
                  <li>Exchange Password (if applicable)</li>
                </ul>
              </Col>
              <Col>
                <h2>4. A mnemonic will be generated for you and displayed in a terminal pager. Please write this down and store it in a safe place. You'll be asked to re-enter it after it's displayed.</h2>
              </Col>
              <Col>
                <h2>5. Confirm the mnemonic</h2>
              </Col>
              <Col>
                <h2>6. Send BTC to your capacity address and exchange address to begin fulfilling swaps.</h2>
                <p>You'll be able to market maker for swaps valued up to at most the amount of BTC in your capacity address.</p>
              </Col>
              <Col>
                <h2>7. Your market maker node is all set up! Please return to the dashboard and keep this server running to continue earning.</h2>
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