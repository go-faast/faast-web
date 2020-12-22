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
            <span>Fund your Maker</span>
          </CardHeader>
          <CardBody className={card}>
            <Row>
              <Col xs='12'>
                <h2 className={classNames(text, 'mt-2')}>Deposit BTC to your capacity address</h2>
                <p className={classNames(text)}>The amount you deposit is the maximum value of swaps you can fulfill at one time.</p>
              </Col>
              <Col xs='12'>
                <h5 className={classNames(text, 'mt-2')}>1. Create an ubuntu 18.04 server. Cloud hosting is recommended for 24/7 uptime (ex: digital ocean, AWS). </h5>
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