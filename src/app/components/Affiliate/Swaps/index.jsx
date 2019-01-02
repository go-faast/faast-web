import React from 'react'
import { compose, setDisplayName } from 'recompose'

import AffiliateLayout from 'Components/Affiliate/Layout'
import SwapsTable from 'Components/Affiliate/SwapsTable'


const AffiliateSwaps = () => {
  return (
    <AffiliateLayout className='pt-4'>
      <SwapsTable />
    </AffiliateLayout>
  )
}

export default compose(
  setDisplayName('AffiliateSwaps'),
)(AffiliateSwaps)
