import { compose, setDisplayName, withProps } from 'recompose'

import SwapSubmit from 'Components/SwapSubmit'

export default compose(
  setDisplayName('SwapSubmitModal'),
  withProps({
    modal: true,
  })
)(SwapSubmit)
