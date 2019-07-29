import React, { Fragment } from 'react'
import Header from 'Site/components/Header'
import { compose, setDisplayName, setPropTypes, defaultProps } from 'recompose'
import { Row, Col } from 'reactstrap'
import classNames from 'class-names'
import PropTypes from 'prop-types'

const Hero = ({ translations }) => {
  return (
    <Fragment>
      <Header theme='dark' headerColor='#212121' translations={translations} />
      <div className='jumbotron jumbotron-fluid hero-technology'>
        <h1>Don’t Get Goxxed. Own Your Crypto.</h1>
        <h5>If it’s not your keys, it’s not your crypto. Trade safely from your own wallet with Faa.st.</h5>
      </div>
    </Fragment>
  )}

export default compose(
  setDisplayName('Hero'),
)((Hero))