import React from 'react'
import { compose, setDisplayName } from 'recompose'
import { Button, Row, Col } from 'reactstrap'
import Fade from 'react-reveal/Fade'

import PrivacyFeature from 'Img/finger-scanner.png'
import SecureFeature from 'Img/lock-key.png'
import FastFeature from 'Img/lightning.png'
import FeesFeature from 'Img/coins-fees.png'

import classNames from 'class-names'

import style from './style.scss'

const features = [{
  heading: 'Private',
  description: 'With Faa.st there is no need to register an account or share any personal info.',
  icon: PrivacyFeature,
  fade: {
    left: true
  }
}, {
  heading: 'Safe & Secure',
  description: 'Trade directly from your wallet— we never control your funds or see your private key.',
  icon: SecureFeature,
  fade: {
    top: true
  }
}, {
  heading: 'Simple & Fast',
  description: 'Intuitive and mobile friendly UI makes crypto trading simple and easy and instant access to over 100+ coins.',
  icon: FastFeature,
  fade: {
    bottom: true
  }
}, {
  heading: 'Low Fees',
  description: 'No deposit fees. No subscription fees. No exit fees. Faast is a simple, low cost on-chain trading engine.',
  icon: FeesFeature,
  fade: {
    right: true
  }
}]

const Features = () => {
  return (
    <Row className={classNames(style.featuresContainer, 'mx-auto align-content-start')}>
      <Col xs='12'>
        <h1>Faa.st Features</h1>
      </Col>
      <Col className='d-flex px-0' xs='12'>
        <Row className='flex-lg-nowrap mx-0 px-lg-0 px-3'>
          {features.map(feature => {
            return (
              <Col className={classNames(style.featureContainer, 'd-flex justify-content-center px-0')} xs='12' md='6' lg='3' key={feature.heading}>
                <Fade {...feature.fade} duration={1200} distance='80px' >
                  <div className={style.feature}>
                    <i className='fa fa-check' aria-hidden='true'></i>
                    <h4 className={style.featureTitle}>{feature.heading}</h4>
                    <p className={style.featureDescription}>{feature.description}</p>
                  </div>
                </Fade>
              </Col>
            )
          })}
        </Row>
      </Col>
      <div className={classNames(style.button, 'my-lg-0 my-4 text-center w-100')}>
        <Button className='text-white' color='primary'>Connect Your Wallet</Button>
      </div>
    </Row>
  )}

export default compose(
  setDisplayName('Features'),
)((Features))