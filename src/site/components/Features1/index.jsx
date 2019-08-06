import React from 'react'
import { compose, setDisplayName } from 'recompose'
import { Button } from 'reactstrap'

import PrivacyFeature from 'Img/finger-scanner.png'
import SecureFeature from 'Img/lock-key.png'
import FastFeature from 'Img/lightning.png'
import FeesFeature from 'Img/coins-fees.png'

import style from './style.scss'

const features = [{
  heading: 'Private',
  description: 'With Faa.st there is no need to register an account or share any personal info.',
  icon: PrivacyFeature
}, {
  heading: 'Safe & Secure',
  description: 'Trade directly from your wallet— we never control your funds or see your private key.',
  icon: SecureFeature
}, {
  heading: 'Simple & Fast',
  description: 'Intuitive and mobile friendly UI makes crypto trading simple and easy and instant access to over 100+ coins.',
  icon: FastFeature
}, {
  heading: 'Low Fees',
  description: 'No deposit fees. No subscription fees. No exit fees. Faast is a simple, low cost on-chain trading engine.',
  icon: FeesFeature
}]

const Features = () => {
  return (
    <div className={style.featuresContainer}>
      <h1>Faa.st Features</h1>
      {features.map(feature => {
        return (
          <div key={feature.heading} className={style.feature}>
            <i className='fa fa-check' aria-hidden='true'></i>
            <h4 className={style.featureTitle}>{feature.heading}</h4>
            <p className={style.featureDescription}>{feature.description}</p>
          </div>
        )
      })}
      <div style={{ bottom: 50 }} className='position-absolute text-center w-100'>
        <Button className='text-white' color='primary'>Connect Your Wallet</Button>
      </div>
    </div>
  )}

export default compose(
  setDisplayName('Features'),
)((Features))