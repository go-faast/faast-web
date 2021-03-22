/* eslint-disable react/no-unescaped-entities */
import React from 'react'
import { compose, setDisplayName } from 'recompose'
import { Row, Col } from 'reactstrap'
import classNames from 'class-names'

import CoinIcon from 'Components/CoinIcon'
import homeStyle from 'Site/pages/Home1/style.scss'
import style from './style.scss'
import { shadow } from 'Site/pages/MarketMaker/style.scss'
import { popularCoins } from 'Site/pages/MarketMaker'

import Fade from 'react-reveal/Fade'

const MakerSection = () => {
  return (
    <Row style={{ marginTop: 0 }} className={classNames(homeStyle.sectionContainer, 'p-0 mx-0')}>
      <Col className='p-0 pl-md-3 pl-0 text-xs-center text-left' xs={{ order: 1, size: 12 }}  lg={{ order: 0, size: 6 }}>
        <Fade duration={1200} distance='80px' bottom>
          <h2 className='d-none d-lg-block' style={{ fontWeight: 600, marginBottom: 10 }}>Popular Coins for Faa.st Makers</h2>
          <Row className='justify-content-center mx-auto mt-4' style={{ maxWidth: 600 }}>
            {popularCoins.map((coin, i) => {
              return (
                <Col 
                  xs='6' 
                  key={coin} 
                  className={classNames(shadow, 'py-3 mb-2 text-center', i % 2 == 0 && 'mr-2 ml-lg-0 ml-2')} 
                  style={{ backgroundColor: '#fff', borderRadius: 4, maxWidth: 250, cursor: 'default' }}
                >
                  <CoinIcon style={{ marginRight: 10 }} symbol={coin} /> 
                  <span style={{ fontSize: 22, color: '#1A212A', fontWeight: 600, verticalAlign: 'middle' }}>{coin}</span>
                </Col>
              )
            })}
          </Row>
        </Fade>
      </Col>
      <Col 
        xs={{ order: 0, size: 12 }} 
        lg={{ order: 1, size: 6 }} 
        className={classNames(style.textContainer, 'p-0 px-xs-5 px-3 mb-lg-0 mb-3 align-self-center')}
      >
        <Fade duration={1200} distance='80px' right>
          <span
            className='px-3 mb-3 d-inline-block'
            style={{ background: 'linear-gradient(45deg, #e33966 0%, #ad173e 100%)', borderRadius: 20, }}
          >
            New
          </span>
          <h2 className={classNames(homeStyle.heading, 'mb-3')}>
            Liquidity Mining on Faa.st
          </h2>
          <p className={homeStyle.description}>
            Run a Faa.st powered market maker node, fulfill swaps, contribute to decentralizing the financial world, and earn liquidity rewards in a coin you’re excited about.
          </p>
          <a className={classNames(homeStyle.link, 'mb-3 d-inline-block')} href='/app/connect'>
            More on Liquidity Mining <i className='fa fa-arrow-right' />
          </a>
        </Fade>
      </Col>
    </Row>
  )}

export default compose(
  setDisplayName('MakerSection'),
)((MakerSection))