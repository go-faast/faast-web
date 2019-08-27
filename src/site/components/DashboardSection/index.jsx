/* eslint-disable react/no-unescaped-entities */
import React, { Fragment } from 'react'
import { compose, setDisplayName } from 'recompose'
import { Row, Col } from 'reactstrap'
import classNames from 'class-names'
import FaastMockup from 'Img/faast-mockup.svg'

import homeStyle from 'Site/pages/Home1/style.scss'
import style from './style.scss'

let Fade = Fragment
// if (typeof window !== 'undefined') {
//   import('react-reveal/Fade')
//     .then((fade) => {
//       Fade = fade
//     }).catch(() => {
//       Fade = Fragment
//     })
// }

const DashboardSection = ({ translations: { static: { dashboard: t } } }) => {
  return (
    <Row style={{ marginTop: 0 }} className={classNames(homeStyle.sectionContainer, 'p-0 mx-0')}>
      <Col className='p-0 pl-md-3 pl-0 text-xs-center text-left' xs={{ order: 1, size: 12 }}  lg={{ order: 0, size: 7 }}>
        <Fade duration={1200} distance='80px' bottom>
          <img src={FaastMockup} className={style.mockup} />
        </Fade>
      </Col>
      <Col 
        xs={{ order: 0, size: 12 }} 
        lg={{ order: 1, size: 5 }} 
        className={classNames(style.textContainer, 'p-0 pr-3 pl-3 mb-lg-0 mb-3 align-self-center')}
      >
        <Fade duration={1200} distance='80px' right>
          <h2 className={classNames(homeStyle.heading, 'mb-3')}>
            {t.swap}
          </h2>
          <p className={homeStyle.description}>
            {t.connect}
          </p>
          <a className={classNames(homeStyle.link, 'mb-3 d-inline-block')} href='/app/connect'>
            {t.connectYourWallet} <i className='fa fa-arrow-right' />
          </a>
        </Fade>
      </Col>
    </Row>
  )}

export default compose(
  setDisplayName('DashboardSection'),
)((DashboardSection))