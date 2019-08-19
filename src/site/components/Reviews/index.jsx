import React from 'react'
import { compose, setDisplayName, withHandlers, withState } from 'recompose'
import classNames from 'class-names'
import { Row, Col, Carousel, CarouselItem, CarouselControl, } from 'reactstrap'
import Fade from 'react-reveal/Fade'

import TwitterStripes from 'Img/twitter-stripes.svg'

import style from './style.scss'
import homeStyle from 'Site/pages/Home1/style.scss'

const slides = [{
  name: 'Cryptopotamus',
  username: '@CryptoDolla',
  date: 'Aug 8',
  profileImage: 'https://pbs.twimg.com/profile_images/913078899105566723/0UTC1ImL_400x400.jpg',
  text: [
    'Had the pleasure of checking out the faa.st platform thanks to @goFaast. The UI is beautifully smooth & simple. It has a unique function in $CRYPTO:', 
    'Cross-chain trading from your own wallet, including hardware wallets. This is the only way you should be trading'
  ],
  url: 'https://twitter.com'
}, {
  name: 'A v B',
  username: '@ArminVanBitcoin',
  date: 'May 24, 2018',
  profileImage: 'https://pbs.twimg.com/profile_images/1121999658031644673/GHCNxji7_x96.jpg',
  text: [
    'You can now trade your #altcoin tokens for #bitcoin and vice-versa directly from your Trezor wallet. Secure. Private. Faast.', 
  ],
  url: 'https://twitter.com'
}]

const Reviews = ({ handleNext, handlePrevious, currentSlide, translations: { static: { reviews: trans } } }) => {
  return (
    <div style={{ marginTop: 200, paddingBottom: 60 }} className='text-center position-relative'>
      <h1 className={homeStyle.heading}>{trans.twitterFam}</h1>
      <div className={classNames('position-relative', style.zIndex)}>
        <Fade duration={1200} distance='80px' bottom>
          <Carousel 
            activeIndex={currentSlide} 
            next={handleNext}
            previous={handlePrevious}
            tag={Row} 
            pause='hover'
            interval='8000'
            className={classNames('position-relative justify-content-around align-items-center mx-0 px-0', style.zIndex)}
          >
            <CarouselControl 
              tag={Col} 
              className='d-flex justify-content-end col col-xs-2 cursor-pointer' 
              direction='prev' 
              directionText='Previous' 
              onClickHandler={handlePrevious}>
              <Fade duration={1200} distance='80px' left>
                <div className={style.button}>
                  <i className='fa fa-chevron-left'></i>
                </div>
              </Fade>
            </CarouselControl>
            {slides.map(slide => (
              <CarouselItem key={slide.username} tag={Col} className='position-relative' style={{ zIndex: 999 }} xs='8'>
                <Row className={classNames(style.tweet, 'mx-auto py-5 px-xs-3 px-4 position-relative')}>
                  <Col className='p-0 text-md-center text-left mb-md-0 mb-3' xs='12' md='2' lg='2'>
                    <div>
                      <img src={slide.profileImage} style={{ width: 50, height: 50, borderRadius: '50%' }} />
                    </div>
                  </Col>
                  <Col className='text-left px-0' xs='12' md='10' lg='10'>
                    <h3 className={style.tweetMeta}>{slide.name} <span>{slide.username} · {slide.date}</span></h3>
                    {slide.text.map(t => (<p key={t} className={style.tweetText}>{t}</p>))}
                    <a className={style.tweetLink} href={slide.url}>{trans.viewOriginal}</a>
                  </Col>
                  <i style={{ top: 30, right: 30, color: '#1DA1F2', fontSize: 18 }} className='fab fa-twitter position-absolute'></i>
                </Row>
              </CarouselItem>
            ))}
            <CarouselControl 
              tag={Col} 
              className='d-flex justify-content-start col col-xs-2 cursor-pointer' 
              direction='next' 
              directionText='Next' 
              onClickHandler={handleNext}>
              <Fade duration={1200} distance='80px' right>
                <div className={style.button}>
                  <i className='fa fa-chevron-right'></i>
                </div>
              </Fade>
            </CarouselControl>
          </Carousel>
        </Fade>
      </div>
      <div className='position-absolute w-100 text-center mt-md-0 mt-4' style={{  top: 20, left: 0, zIndex: 1 }}>
        <img src={TwitterStripes} style={{ maxWidth: 814, maxHeight: 462, }} />
      </div>
    </div>
  )
}

export default compose(
  setDisplayName('Reviews'),
  withState('currentSlide', 'setCurrentSlide', 0),
  withHandlers({
    handleNext: ({ currentSlide, setCurrentSlide }) => () => {
      if (currentSlide >= slides.length - 1) {
        setCurrentSlide(0)
      } else {
        setCurrentSlide(currentSlide + 1)
      }
    },
    handlePrevious: ({ currentSlide, setCurrentSlide }) => () => {
      if (currentSlide == 0) {
        setCurrentSlide(slides.length - 1)
      } else {
        setCurrentSlide(currentSlide - 1)
      }
    }
  })
)((Reviews))
