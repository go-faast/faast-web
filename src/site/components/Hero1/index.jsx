import React, { Fragment } from 'react'
import Header from 'Site/components/Header'
import { compose, setDisplayName, setPropTypes, defaultProps } from 'recompose'
import { Row, Col } from 'reactstrap'
import classNames from 'class-names'
import PropTypes from 'prop-types'

import HeroChart from 'Img/hero-chart.svg'

const Hero = ({ translations }) => {
  return (
    <Fragment>
      <Header theme='dark' headerColor='#191A1D' translations={translations} />
      <div style={{ backgroundColor: '#191A1D', minHeight: 700 }} className='jumbotron jumbotron-fluid hero-technology position-relative'>
        <h1 className='mt-0' style={{ fontWeight: 600, color: '#EFEFEF' }}>Don’t Get Goxxed. Own Your Crypto.</h1>
        <h5 style={{ color: '#9C9FA8' }}>If it’s not your keys, it’s not your crypto. Trade safely from your own wallet with Faa.st.</h5>
        <div className='mx-auto mt-5' style={{ width: 995, height: 136, backgroundColor: '#EFEFEF', borderRadius: 4, boxShadow: '0px 2px 5px 4px rgba(0,0,0,.2)' }}></div>
        <div style={{ bottom: 0 }} className='position-absolute'>
          <img style={{ width: '100vw', height: 260 }} src={HeroChart} />
        </div>
      </div>
    </Fragment>
  )}

export default compose(
  setDisplayName('Hero'),
)((Hero))