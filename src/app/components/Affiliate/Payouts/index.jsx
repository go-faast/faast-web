import React from 'react'
import { compose, setDisplayName } from 'recompose'

import AffiliateLayout from 'Components/Affiliate/Layout'
import WithdrawalTable from 'Components/Affiliate/WithdrawalTable'

const AffiliatePayouts = () => {
  return (
    <AffiliateLayout className='pt-4'>
      <WithdrawalTable/>
    </AffiliateLayout>
  )
}

export default compose(
  setDisplayName('AffiliatePayouts'),
)(AffiliatePayouts)
