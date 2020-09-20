import React, { Fragment } from 'react'
import { Helmet } from 'react-helmet'
import { withRouter } from 'react-router'
import { compose, setDisplayName } from 'recompose'

import NewsTable from 'Components/NewsTable'
import Layout from 'Components/Layout'

const AssetNews = () => (
  <Fragment>
    <Helmet>
      <title>Cryptocurrency News - Faa.st</title>
      <meta name='description' content='Cryptocurrency news from crypto news outlets, twitter, reddit, and other social media sources.' /> 
    </Helmet>
    <Layout className='pt-3'>
      <NewsTable symbols={[]} />
    </Layout>
  </Fragment>
)

export default compose(
  setDisplayName('AssetNews'),
  withRouter
)(AssetNews)
