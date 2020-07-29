import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import { compose, setDisplayName, setPropTypes } from 'recompose'

import GooglePlay from 'Img/google-play.svg'
import AppStore from 'Img/app-store.svg'

export default compose(
  setDisplayName('AppStoreLinks'),
  setPropTypes({
    google: PropTypes.string,
    apple: PropTypes.string,
  }),
)(({ google, apple }) => (
  <Fragment>
    <a className='mr-3' href={google}><img src={GooglePlay} alt='Get on Google Play'/></a>
    <a href={apple}><img src={AppStore} alt='Download on App Store'/></a>
  </Fragment>
))
