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
                <h5 className={classNames(text, 'mt-2')}>1. Create an Ubuntu server. Cloud hosting is recommended for 24/7 uptime (ex: digital ocean, AWS). </h5>
              </Col>
              <Col xs='12'>
                <h5 className={classNames(text, 'mt-4 mb-0')}>2. SSH into your server. Do not user username/password SSH. If you do not know what this means, learn about it <a href='https://www.digitalocean.com/community/tutorials/how-to-configure-ssh-key-based-authentication-on-a-linux-server' target='_blank noreferrer'>here.</a></h5>
              </Col>
              <Col xs='12'>
                <h5 className={classNames(text, 'mt-4')}>3. Run the following command to install.</h5>
                <code>curl -o- https://raw.githubusercontent.com/go-faast/maker-bot/master/install.sh | bash</code>
              </Col>
              <Col xs='12'>
                <h5 className={classNames(text, 'mt-4')}>4. Follow the installation prompts to finish setting up your maker.</h5>
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