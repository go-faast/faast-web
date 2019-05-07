/* eslint-disable */
import * as React from 'react'
import { compose, setDisplayName } from 'recompose'
import { withRouteData } from 'react-static'
import { Row, Col, Button, Container, Card, CardBody, Collapse } from 'reactstrap'

import Header from 'Site/components/Header'
import Footer from 'Site/components/Footer'

import classNames from 'class-names'

import { blobs, blob, faq, numbers, subtitle, why } from './style.scss'

const blueColor = '#323540'

export default compose(
  setDisplayName('MarketMaker'),
  withRouteData
)(({ translations = {}, translations: { static: { marketMaker: t } } }) => {
  const faqCopy = [
    {
      q: t.q1,
      a: t.a1,
    },
    {
      q: t.q2,
      a: t.a2,
    },
    {
      q: t.q3,
      a: t.a3,
    },
    {
      q: t.q4,
      a: t.a4,
    },
    {
      q: t.q5,
      a: t.a5,
    },
    {
      q: t.q6,
      a: t.a6,
    },
    {
      q: t.q7,
      a: t.a7,
    },
    {
      q: t.q8,
      a: t.a8,
    },
    {
      q: t.q9,
      a: t.a9,
    },
    {
      q: t.q10,
      a: t.a10,
    },
    {
      q: t.q11,
      a: t.a11,
    },
  ]
  return (
    <div style={{ maxWidth: '100vw', overflowX: 'hidden' }}>
      <Header 
        theme='dark' 
        style={{ zIndex: 9 }} 
        className='position-relative' 
        headerColor={blueColor} 
        translations={translations} 
      />
      <div style={{ minHeight: '85vh', backgroundColor: blueColor }} className={classNames('mb-0 py-5 position-relative')}>
        <Row className='py-3 mx-auto position-relative' style={{ maxWidth: 1280, zIndex: 99 }}>
          <Col sm='12' className='text-center'>
            <h1 className='font-weight-bold text-white mt-3'>{t.bitcoinWork}</h1>
            <h5 className={classNames(subtitle, 'mx-auto mt-3')} style={{ color: '#9BA5B6' }}>
              {t.runNode}
            </h5>
            <Button 
              className='mt-4 d-inline-block font-weight-bold' 
              style={{ backgroundColor: '#56C8B8', borderRadius: 20, color: '#fff', width: 240 }} 
              tag='a' 
              href={'https://docs.google.com/forms/d/e/1FAIpQLSfxnI0SPvQu-4oVi2YCa7Lp_UEK8WyDFNFSMoXVxZD7Ioxjzw/formResponse'} 
              target='_blank noopener noreferrer' 
              color='primary'
            >
              {t.signUpBeta}
            </Button>
            <small><span style={{ color: '#A9A9B6' }} className='font-xxs d-block mb-4 mt-2'>{t.noUSA}</span></small>
          </Col>
          <Col className='mt-3' sm='12'>
            <div className={blobs}>
              <div className={blob}>₿</div>
              <div className={blob}>₿</div>
              <div className={blob}>₿</div>
              <div className={blob}>₿</div>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" version="1.1">
              <defs>
                <filter id="goo">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
                  <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="goo" />
                  <feBlend in="SourceGraphic" in2="goo" />
                </filter>
              </defs>
            </svg>
          </Col>
        </Row>
        <div style={{ bottom: 0, left: 0, zIndex: 1 }} className='position-absolute'>
          <img style={{ width: '100%', maxHeight: 551, pointerEvents: 'none' }} src='https://i.imgur.com/CKbwoEu.png' />
        </div>
      </div>
      <Row style={{ background: '#F6FAFE' }} className='text-center pb-5'>
        <Col>
          <h1 className='font-weight-bold mt-5 pt-3' style={{ color: blueColor }}>{t.whyMarketMaker}</h1>
          <h5 className={classNames(why, 'mx-auto mt-3 font-weight-bold')} style={{ color: '#85889B' }}>{t.runNodeAllows}</h5>
          <h5 className={classNames(why, 'mx-auto mt-3')} style={{ color: '#85889B'}}>{t.earlyDays}</h5>
          <Row className='mt-5 text-center'>
            <Col className='mt-md-0 mt-3' sm='12' md='12' lg='4'>
              <div 
                className='d-inline-block px-4 py-2' 
                style={{ background: '#fff', boxShadow: '0px 5px 11px 1px rgba(200,216,236,0.5)', width: 318, borderRadius: 4 }}
              >
                <img style={{ width: 40 }} src='https://i.imgur.com/24WeJaL.png' />
                <h4 className='font-weight-bold mt-2' style={{ color: '#23D6B8' }}>{t.earnInterest}</h4>
                <p style={{ color: '#2D303A' }}>{t.btcCommission}</p>
              </div>
            </Col>
            <Col className='mt-md-0 mt-3' sm='12' md='12' lg='4'>
              <div 
                className='d-inline-block px-4 py-2' 
                style={{ background: '#fff', boxShadow: '0px 5px 11px 1px rgba(200,216,236,0.5)', width: 318, borderRadius: 4 }}
              >
                <img style={{ width: 40 }} src='https://i.imgur.com/FLaUbIm.png' />
                <h4 className='font-weight-bold mt-2' style={{ color: '#23D6B8' }}>{t.accessLiquidity}</h4>
                <p style={{ color: '#2D303A' }}>{t.lowVolume}</p>
              </div>
            </Col>
            <Col className='mt-md-0 mt-3' sm='12' md='12' lg='4'>
              <div 
                className='d-inline-block px-4 py-2' 
                style={{ background: '#fff', boxShadow: '0px 5px 11px 1px rgba(200,216,236,0.5)', width: 318, borderRadius: 4 }}
              >
                <img style={{ width: 40 }} src='https://i.imgur.com/LmLTn27.png' />
                <h4 className='font-weight-bold mt-2' style={{ color: '#23D6B8' }}>{t.supportDecentralization}</h4>
                <p style={{ color: '#2D303A' }}>{t.majorityVolume}</p>
              </div>
            </Col>
            <Button 
              className='mt-5 d-inline-block font-weight-bold mx-auto' 
              style={{ backgroundColor: '#56C8B8', borderRadius: 20, color: '#fff', width: 240 }} 
              tag='a' 
              href={'https://docs.google.com/forms/d/e/1FAIpQLSfxnI0SPvQu-4oVi2YCa7Lp_UEK8WyDFNFSMoXVxZD7Ioxjzw/formResponse'} 
              target='_blank noopener noreferrer' 
              color='primary'
            >
              {t.learnMore}
            </Button>
          </Row>
        </Col>
      </Row>
      <Row style={{ background: '#fff' }} className='text-center pb-5'>
        <Col>
          <h1 className='font-weight-bold mt-5 pt-3' style={{ color: blueColor }}>Frequently Asked Questions</h1>
          <Container>
            {faqCopy.map((x, i) => {
              return (
                <Row key={i} className={classNames('text-left mb-3', i == 0 && 'mt-5')}>
                  <Col>
                    <Collapse isOpen={true}>
                      <Card className='flat border-0'>
                        <CardBody className={faq}>
                          <h5 style={{ color: blueColor }}>{x.q}</h5>
                          {x.a}
                        </CardBody>
                      </Card>
                    </Collapse>
                  </Col>
                </Row>
              )
            })}
          </Container>
        </Col>
      </Row>
      <Row className='text-center pt-5' style={{ backgroundColor: '#374B5D' }}>
        <Col>
          <h1 className={classNames(numbers, 'font-weight-bold')}>1</h1>
          <p>{t.signUpBeta}</p>
        </Col>
        <Col>
          <h1 className={classNames(numbers, 'font-weight-bold')}>2</h1>
          <p>{t.runMakerNode}</p>
        </Col>
        <Col>
          <h1 className={classNames(numbers, 'font-weight-bold')}>3</h1>
          <p>{t.earnInterest}</p>
        </Col>
      </Row>
      <Row className='text-center pb-5' style={{ backgroundColor: '#374B5D' }}>
        <Col sm='12'>
          <Button 
            className='mt-4 d-inline-block font-weight-bold' 
            style={{ backgroundColor: '#56C8B8', borderRadius: 20, color: '#fff', width: 240 }} 
            tag='a' 
            href={'https://docs.google.com/forms/d/e/1FAIpQLSfxnI0SPvQu-4oVi2YCa7Lp_UEK8WyDFNFSMoXVxZD7Ioxjzw/formResponse'} 
            target='_blank noopener noreferrer' 
            color='primary'
          >
            {t.signUpBeta}
          </Button>
        </Col>
      </Row>
      <Footer translations={translations} />
    </div>
  )})
