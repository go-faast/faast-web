import React from 'react'
import { compose, setDisplayName, withProps } from 'recompose'
import Layout from 'Components/Layout'
import * as qs from 'query-string'

import SwapStepOne from './SwapStepOne'
import SwapStepTwo from './SwapStepTwo'

const SwapWidget = ({ urlParams }) => {
  const { to, from } = urlParams
  return (
  <Layout className='pt-3'>
    <h4 className='mt-2 text-primary'>Swap Widget</h4>
    {(!to || !from)
    ? <SwapStepOne/>
    : <SwapStepTwo/>}
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
