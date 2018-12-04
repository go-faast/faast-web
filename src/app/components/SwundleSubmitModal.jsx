import { compose, setDisplayName, withProps } from 'recompose'

import SwundleSubmit from 'Components/SwundleSubmit'

export default compose(
  setDisplayName('SwundleSubmitModal'),
  withProps({
    modal: true,
  })
)(SwundleSubmit)
