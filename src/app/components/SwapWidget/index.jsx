import React from 'react'
import { compose, setDisplayName } from 'recompose'
import { getSentSwaps } from 'Selectors/swap'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'

import Layout from 'Components/Layout'

const SwapWidget = () => (
  <Layout className='pt-3'>
    <h4 className='mt-2 text-primary'>Swap Widget</h4>
  </Layout>
)

export default compose(
  setDisplayName('SwapWidget'),
)(SwapWidget)
