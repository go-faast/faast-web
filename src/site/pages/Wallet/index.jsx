import * as React from 'react'
import { compose, setDisplayName } from 'recompose'
import { withRouteData } from 'react-static'
import { Row, Col, Button } from 'reactstrap'

import Header from 'Site/components/Header'
import Footer from 'Site/components/Footer'
import MacbookScreenshot1 from 'Img/macbook-screenshot-01.png'
import SecureIcon from 'Img/secure.svg'
import SimpleIcon from 'Img/simple.svg'
import PrivacyIcon from 'Img/privacy.svg'

import classNames from 'class-names'

import { gradient, graphicSection, text } from './style.scss'

export default compose(
  setDisplayName('Wallet'),
  withRouteData
)(({ wallet: { name, graphic, slogan, website, description, supportedAssets, howTo } }) => {
  name = name.replace(' Wallet', '')
  const supportedTickers = supportedAssets ? Object.keys(supportedAssets) : []
  return (
    <div>
      <Header theme='light' headerColor='#fff' />
      <div className={classNames(graphicSection, 'mb-0 py-5')}>
        <div className={gradient}></div>
        <Row className='py-3'>
          <Col sm='12' lg='8' className='text-left pl-md-5 pl-0 ml-5'>
            <h1 className='position-relative w-75'>Trade Instantly, Directly from your {name} Wallet with Faa.st</h1>
            <h4 className='mb-5 text-muted'>{slogan}</h4>
            <Button tag='a' href='https://faa.st/app/connect' className='mr-3' color='primary'>Connect Your {name}</Button>
            <Button style={{ backgroundColor: 'transparent' }} tag='a' href={website} target='_blank noopener noreferrer' outline color='primary'>Learn more</Button>
          </Col>
          <Col>
            <img style={{ maxWidth: 200, maxHeight: 200 }} src={graphic} />
          </Col>
        </Row>
      </div>
      <Row style={{ background: 'rgb(243, 245, 248)', minHeight: 320 }}>
        <Col sm='12' lg='8' className={classNames(text, 'text-left pl-md-5 pl-0 mt-2 pt-5 ml-5')}>
          <h1>{name} and Faa.st</h1>
          <p className='w-75 mt-3'>
            {description} Together with Faa.st you can trade {supportedTickers.map((t, i) => i === supportedTickers.length - 1 ? ` and ${t} ` : ` ${t},`)} directly from your {name} wallet.
          </p>
          <Button 
            tag='a' 
            href={howTo ? howTo : '/app/connect'} 
            className='mt-2 flat' 
            color='primary' 
            outline 
            style={{ background: 'transparent' }}
            target='_blank noopener noreferrer'
          >
            {howTo ? `How to trade from your ${name}` : `Get started with ${name}` }
          </Button>
        </Col>
        <Col>
          <img className='mt-4 pt-5' src={MacbookScreenshot1} style={{ maxWidth: 300 }} />
        </Col>
      </Row>
      <Row className={classNames(text,'text-center p-5')} style={{ background: '#fff' }}>
        <Col sm='12'>
          <h1 className={text}>Why trade from your {name}?</h1>
        </Col>
        <Col sm='4'>
          <img src={SecureIcon} style={{ height: '161px', width: '316px', backgroundColor: 'rgba(243,245,248,0)', padding: '25px' }}/>
          <h5 style={{ fontWeight: 'normal' }}>Secure</h5>
          <p>Your {name} wallet funds and private keys are never in the control of a centralized exchange. If Faa.st was hacked you would lose nothing. <br/></p>
        </Col>
        <Col sm='4'>
          <img src={SimpleIcon} style={{ width: '306px', padding: '36px', backgroundColor: 'rgba(243,245,248,0)', height: '161px' }}/>
          <h5 style={{ fontWeight: 'normal' }}>Simple</h5>
          <p>Connect your {name} wallet and instantly trade your crypto holdings in exchange for over 100+ crypto coins.<br/></p>
        </Col>
        <Col sm='4'>
          <img className='rounded-circle' src={PrivacyIcon} style={{ width: '234px', height: '161px', padding: '36px', backgroundColor: 'rgba(243,245,248,0)' }}/>
          <h5 style={{ fontWeight: 'normal' }}>Private</h5>
          <p>You don’t need to share personal data, photo ID, or anything else— just safe and confidential trades.<br/></p>
        </Col>
        <Col className='pt-4'>
          <Button style={{ width: '90%', maxWidth: 400 }} size='lg' color='dark' tag='a' href='/app'>Get Started</Button>
        </Col>
      </Row>
      <Footer />
    </div>
  )})
