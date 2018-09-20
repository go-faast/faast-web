import React from 'react'
import { compose, setDisplayName } from 'recompose'
import Layout from 'Components/Layout'

import SwapStepOne from './SwapStepOne'

const SwapWidget = () => {

  return (
  <Layout className='pt-3'>
    <SwapStepOne/>
  </Layout>
  )
}

export default compose(
  setDisplayName('SwapWidget'),
)(SwapWidget)
