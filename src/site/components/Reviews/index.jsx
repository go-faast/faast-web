import React from 'react'
import { compose, setDisplayName } from 'recompose'
import classNames from 'class-names'
import { Row, Col } from 'reactstrap'
import Fade from 'react-reveal/Fade'

import TwitterStripes from 'Img/twitter-stripes.svg'

import style from './style.scss'
import homeStyle from 'Site/pages/Home1/style.scss'

const Reviews = () => {
  return (
    <div style={{ marginTop: 200, paddingBottom: 60 }} className='text-center position-relative'>
      <h1 className={homeStyle.heading}>#💞 from the Twitter Fam</h1>
      <Row style={{ zIndex: 2 }} className='position-relative justify-content-around align-items-center mx-0 px-0'>
        <Col className='d-flex justify-content-end' xs='2'>
          <Fade duration={1200} distance='80px' left>
            <div className={style.button}>
              <i className='fa fa-chevron-left'></i>
            </div>
          </Fade>
        </Col>
        <Col xs='8'>
          <Fade duration={1200} distance='80px' bottom>
            <Row className={classNames(style.tweet, 'mx-auto py-5 px-3 position-relative')}>
              <Col xs='1'>
                <div>
                  <img src='https://pbs.twimg.com/profile_images/913078899105566723/0UTC1ImL_400x400.jpg' style={{ width: 50, height: 50, borderRadius: '50%' }} />
                </div>
              </Col>
              <Col className='text-left pl-4'>
                <h3 className={style.tweetMeta}>Cryptopotamus <span>@CryptoDolla · Aug 2</span></h3>
                <p className={style.tweetText}>Had the pleasure of checking out the faa.st platform thanks to @goFaast. The UI is beautifully smooth & simple. It has a unique function in $CRYPTO:</p>
                <p className={style.tweetText}>Cross-chain trading from your own wallet, including hardware wallets. This is the only way you should be trading</p>
                <a className={style.tweetLink} href=''>View Original Tweet</a>
              </Col>
              <i style={{ top: 30, right: 30, color: '#1DA1F2', fontSize: 18 }} className='fab fa-twitter position-absolute'></i>
            </Row>
          </Fade>
        </Col>
        <Col className='d-flex justify-content-start' xs='2'>
          <Fade duration={1200} distance='80px' right>
            <div className={style.button}>
              <i className='fa fa-chevron-right'></i>
            </div>
          </Fade>
        </Col>
      </Row>
      <div className='position-absolute w-100 text-center' style={{  top: 20, left: 0, zIndex: 1 }}>
        <img src={TwitterStripes} style={{ width: 814, height: 462, }} />
      </div>
    </div>
  )
}

export default compose(
  setDisplayName('Reviews'),
)((Reviews))
