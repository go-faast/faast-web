import React, { Fragment } from 'react'
import Header from 'Site/components/Header'
import { compose, setDisplayName, setPropTypes, defaultProps } from 'recompose'
import Fade from 'react-reveal/Fade'
import { Row, Col } from 'reactstrap'
import classNames from 'class-names'
import PropTypes from 'prop-types'

import SwapWidget from '../SwapWidget1'

import HeroChart from 'Img/hero-chart.svg'

const Hero = ({ supportedAssets, translations }) => {
  return (
    <Fragment>
      <Header theme='dark' headerColor='#191A1D' translations={translations} />
      <div style={{ backgroundColor: '#191A1D', minHeight: 700 }} className='jumbotron jumbotron-fluid hero-technology position-relative'>
        <h1 className='mt-0' style={{ fontWeight: 600, color: '#EFEFEF' }}>Don’t Get Goxxed. Own Your Crypto.</h1>
        <h5 style={{ color: '#9C9FA8' }}>If it’s not your keys, it’s not your crypto. Trade safely from your own wallet with Faa.st.</h5>
        <div className='position-relative' style={{ zIndex: 999 }}>
          <Fade duration={1200} distance='80px' bottom>
            <SwapWidget translations={translations} assets={supportedAssets} />
          </Fade>
        </div>
        <div style={{ bottom: 0, zIndex: 1 }} className='position-absolute'>
          <img style={{ width: '100vw', height: 260 }} src={HeroChart} />
        </div>
      </div>
    </Fragment>
  )}

export default compose(
  setDisplayName('Hero'),
  setPropTypes({
    supportedAssets: PropTypes.arrayOf(PropTypes.object),
    translations: PropTypes.object
  }),
  defaultProps({
    supportedAssets: [{}],
    showMacScreenShot: true
  }),
)((Hero))