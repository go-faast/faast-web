import React from 'react'
import { compose, setDisplayName, withProps } from 'recompose'
import Layout from 'Components/Layout'
import * as qs from 'query-string'

import SwapStepOne from './SwapStepOne'
import SwapStepTwo from './SwapStepTwo'

const SwapWidget = ({ urlParams }) => {
  const { id } = urlParams
  return (
  <Layout className='pt-3'>
  {!id ? <SwapStepOne/> : <SwapStepTwo swapId={id} />}
  </Layout>
  )
}

export default compose(
  setDisplayName('SwapWidget'),
  withProps(() => {
    const urlParams = qs.parse(location.search)
    return {
      urlParams
    }
  })
)(SwapWidget)
