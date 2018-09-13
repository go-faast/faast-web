import React from 'react'
import { compose, setDisplayName } from 'recompose'

const SwapStepTwo = () => (
    <h4 className='mt-2 text-primary'>Swap Step 2</h4>
)

export default compose(
  setDisplayName('SwapStepTwo'),
)(SwapStepTwo)