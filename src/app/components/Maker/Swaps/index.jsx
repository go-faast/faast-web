import React from 'react'
import { compose, setDisplayName } from 'recompose'
import MakerLayout from 'Components/Maker/Layout'
import SwapsTable from 'Components/Maker/SwapsTable'


const MakerSwaps = () => {
  return (
    <MakerLayout className='pt-4'>
      <SwapsTable title={'Recently Fulfilled Swaps'} />
    </MakerLayout>
  )
}

export default compose(
  setDisplayName('MakerSwaps'),
)(MakerSwaps)
