import * as React from 'react'
import { compose, setDisplayName } from 'recompose'
import { withRouteData } from 'react-static'
import { Row, Col, Button, Card } from 'reactstrap'

import Header from 'Site/components/Header'
import Footer from 'Site/components/Footer'
import MacbookScreenshot1 from 'Img/macbook-screenshot-01.png'

import classNames from 'class-names'

import { gradient, graphicSection } from './style.scss'

export default compose(
  setDisplayName('Wallet'),
  withRouteData
)(({ wallet: { name, graphic, slogan, website } }) => (
  <div>
    <Header />
    <div className={classNames(graphicSection, 'mb-0')}>
      <div className={gradient}></div>
      <Row>
        <Col sm='12' lg='8' className='text-left pl-md-5 pl-0 pt-5 ml-5'>
          <h1 className='position-relative mt-4'>{name.replace(' Wallet', '')} Crypto Wallet</h1>
          <h5 className='mb-5 text-muted'>{slogan}</h5>
          <Button tag='a' href='https://faa.st/app/connect' className='mr-3' color='primary'>Connect Your {name.replace(' Wallet', '')}</Button>
          <Button style={{ backgroundColor: 'transparent' }} tag='a' href={website} target='_blank noopener noreferrer' outline color='primary'>Learn more</Button>
        </Col>
        <Col className='pt-4'>
          <img style={{ maxWidth: 200 }} src={graphic} />
        </Col>
      </Row>
    </div>
    <Row style={{ background: '#fafafa' }}>
      <Card className='p-5 mt-3'>
        1) Connect Your {name.replace(' Wallet', '')}
      </Card>
      <Card className='p-5 mt-3'>
        2) Trade   
      </Card>
      <Card className='p-5 mt-3'>
        3)
      </Card>
    </Row>
    <Footer />
  </div>
))
