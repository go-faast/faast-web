/* eslint-disable react/no-unescaped-entities */
import React, { Fragment } from 'react'
import { Card, CardHeader, CardBody, Row, Col } from 'reactstrap'
import { compose, setDisplayName } from 'recompose'
import classNames from 'class-names'

import MakerLayout from 'Components/Maker/Layout'

import { card, cardHeader, smallCard, text } from '../style'

const MakerSetup = () => {
  return (
    <Fragment>
      <MakerLayout className='pt-5'>
        <Card className={classNames(card, smallCard, 'mx-auto')}>
          <CardHeader className={classNames(cardHeader, 'text-center')}>
            <span>Maker Setup Details</span>
          </CardHeader>
          <CardBody className={card}>
            <Row>
              <Col xs='12'>
                <h5 className={classNames(text, 'mt-2')}>1. Create an ubuntu 18.04 server. Cloud hosting is recommended for 24/7 uptime (ex: digital ocean, AWS). </h5>
              </Col>
              <Col xs='12'>
                <h5 className={classNames(text, 'mt-4 mb-0')}>2. SSH into your server. Do not user username/password SSH. If you do not know what this means, learn about it <a href='https://www.digitalocean.com/community/tutorials/how-to-configure-ssh-key-based-authentication-on-a-linux-server' target='_blank noreferrer'>here.</a></h5>
              </Col>
              <Col xs='12'>
                <h5 className={classNames(text, 'mt-4')}>3. Run one of the following commands to install.</h5>
                <ul className={text}>
                  <li>
                    <code>curl -o- https://raw.githubusercontent.com/go-faast/market-maker-node/master/install.sh | bash</code>
                  </li>
                  <li>
                    <code>wget -qO- https://raw.githubusercontent.com/go-faast/market-maker-node/master/install.sh | bash</code>
                  </li>
                </ul>
              </Col>
              <Col xs='12'>
                <p className={classNames(text, 'mt-3 font-weight-bold')}>Note: The following credentials entered will be stored locally only and never sent anywhere.</p>
                <ul className={text}>
                  <li>Exchange Key</li>
                  <li>Exchange secret</li>
                  <li>Exchange Password (if applicable)</li>
                </ul>
              </Col>
              <Col xs='12'>
                <h5 className={classNames(text, 'mt-4')}>4. A mnemonic will be generated for you and displayed in a terminal pager. Please write this down and store it in a safe place. You'll be asked to re-enter it after it's displayed.</h5>
              </Col>
              <Col xs='12'>
                <h5 className={classNames(text, 'mt-4')}>5. Confirm the mnemonic</h5>
              </Col>
              <Col xs='12'>
                <h5 className={classNames(text, 'mt-4')}>6. Send BTC to your capacity address and exchange address to begin fulfilling swaps.</h5>
                <p className={text}>You'll be able to market maker for swaps valued up to at most the amount of BTC in your capacity address.</p>
              </Col>
              <Col xs='12'>
                <h5 className={classNames(text, 'my-4')}>7. Your market maker node is all set up! Please return to the dashboard and keep this server running to continue earning.</h5>
              </Col>
              <Col xs='12'>
                <span>If you have any questions, don't hesitate to email us at support@faa.st.</span>
              </Col>
            </Row>
          </CardBody>
        </Card>
      </MakerLayout>
    </Fragment>
  )
}

export default compose(
  setDisplayName('MakerSetup'),
)(MakerSetup)