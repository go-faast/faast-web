import React, { Fragment } from 'react'
import { compose, setDisplayName } from 'recompose'
import { Button, Row, Col } from 'reactstrap'
let Fade
if (typeof window !== 'undefined') {
  Fade = require('react-reveal/Fade')
} else {
  Fade = Fragment
}

import PrivacyFeature from 'Img/finger-scanner.png'
import SecureFeature from 'Img/lock-key.png'
import FastFeature from 'Img/lightning.png'
import FeesFeature from 'Img/coins-fees.png'

import classNames from 'class-names'

import style from './style.scss'
import homeStyle from 'Site/pages/Home1/style.scss'

const Features = ({ translations: { static: { features: t } } }) => {
  const features = [{
    heading: t.private,
    description: t.noRegistration,
    icon: PrivacyFeature,
    fade: {
      left: true
    }
  }, {
    heading: t.secure,
    description: t.tradeDirectly,
    icon: SecureFeature,
    fade: {
      top: true
    }
  }, {
    heading: t.simple,
    description: t.swapMultiple,
    icon: FastFeature,
    fade: {
      bottom: true
    }
  }, {
    heading: t.lowFees,
    description: t.noFees,
    icon: FeesFeature,
    fade: {
      right: true
    }
  }]
  return (
    <Row className={classNames(homeStyle.sectionContainer, style.featuresContainer, 'mx-auto align-content-start')}>
      <Col xs='12'>
        <h1 style={{ fontWeight: 600 }}>{t.title}</h1>
      </Col>
      <Col className='d-flex px-0' xs='12'>
        <Row className={classNames(style.cardContainer ,'mx-0 px-lg-0 px-3')}>
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
        <Button className='text-white' color='primary'>{t.connectYourWallet}</Button>
      </div>
    </Row>
  )}

export default compose(
  setDisplayName('Features'),
)((Features))