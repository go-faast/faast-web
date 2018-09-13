import React from 'react'
import { compose, setDisplayName } from 'recompose'

const SwapStepOne = () => (
    <h4 className='mt-2 text-primary'>Swap Step 1</h4>
)

export default compose(
  setDisplayName('SwapStepOne')
)(SwapStepOne)
