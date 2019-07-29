import React from 'react'
import { compose, setDisplayName, setPropTypes, defaultProps } from 'recompose'
import { Row, Col } from 'reactstrap'
import classNames from 'class-names'
import PropTypes from 'prop-types'

import style from './style.scss'
import homeStyle from 'Site/pages/Home1/style.scss'

const features = [{
  heading: 'Private',
  description: 'No need to register or share any personal info.',
  icon: ''
}, {
  heading: 'Safe & Secure',
  description: 'Trade directly from your wallet— we never control your funds or see your private key.',
  icon: ''
}, {
  heading: 'Simple & Fast',
  description: 'Intuitive and mobile friendly UI makes crypto trading simple and easy and instant access to over 100+ coins.',
  icon: ''
}, {
  heading: 'Low Fees',
  description: 'No deposit fees. No subscription fees. No exit fees. Faast is a simple, low cost on-chain trading engine.',
  icon: ''
}]

const Features = () => {
  return (
    <Row className='p-0 m-0 mt-5 pt-5 pb-5'>
      <Col className='p-0 pr-0 pl-3' xs='12' lg='7'>
        <Row className={classNames(style.featuresContainer, 'p-0')}>
          {features.map(({ heading, description, icon }) => (
            <Col xs='12' key={heading} className={classNames(style.feature, 'mr-3 mb-3')}>
              <h2 style={{ color: '#23D6B8', fontSize: 20, fontWeight: 600 }} className='mt-2'>{heading}</h2>
              <p style={{ fontSize: 14 }} className={homeStyle.text}>{description}</p>
              <img src={icon} />
            </Col>
          ))}
        </Row>
      </Col>
      <Col xs='12' lg='5' className='p-0 pr-3 pl-2 align-self-center'>
        <h2 className={classNames(homeStyle.heading, 'mb-3')}>Get Started in Minutes</h2>
        <p className={homeStyle.description}>Simply connect your personal wallet, allocate how much of any coin you want to trade— or even trade multiple coins at once, and build a diversified portfolio in seconds with only a single transaction.</p>
        <a className={classNames(homeStyle.link, 'mb-3 d-inline-block')} href='/app/connect'>Connect your wallet now</a>
      </Col>
    </Row>
  )}

export default compose(
  setDisplayName('Features'),
)((Features))