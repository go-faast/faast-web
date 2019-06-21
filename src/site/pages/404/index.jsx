/* eslint-disable react/no-unescaped-entities */
import React, { Fragment } from 'react'
import { compose, setDisplayName } from 'recompose'
import { withRouteData } from 'react-static'
import withTracker from 'Site/components/withTracker'
import Header from 'Site/components/Header'
import Footer from 'Site/components/Footer'
import { Row, Col } from 'reactstrap'
import classNames from 'class-names'

import Astronaut from 'Img/astronaut.svg'
import StarBG from 'Img/overlay_stars.svg'

import { imageAstronaut, boxAstronaut } from './style.scss'

export default compose(
  setDisplayName('404'),
  withTracker,
  withRouteData,
)(({ translations }) => (
  <Fragment>
    <img src={StarBG} style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, zIndex: 0 }} />
    <div className={classNames(boxAstronaut, 'd-md-block d-none')}>
      <img src={Astronaut} className={imageAstronaut} />
    </div>
    <Header translations={translations} />
    <Row style={{ zIndex: 99999, position: 'relative' }} className='mb-5 pb-5'>
      <Col className='text-center mt-5'>
        <h1 className='text-white mb-4 mt-3' style={{ fontSize: 80 }}>404</h1>
        <h4 className='text-white mb-5 pb-5' style={{ fontSize: 20 }}>Looks like the page you were looking <br/> for can't be found. <a href='/'>Go home.</a></h4>
        <small className='text-muted'>If you think this may be an error on our part please let us know: <br/> support@faa.st</small>
      </Col>
    </Row>
    <Footer translations={translations} showEmail={false} />
  </Fragment>
))
