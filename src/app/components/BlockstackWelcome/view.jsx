import React from 'react'

import WelcomeModal from './Modal'
import CreateWalletModal from 'Components/CreateWalletModal'

const WelcomeView = (props) => {
  return (
    <div>
      {(props.view === 'downloadKeystore' &&
        <CreateWalletModal {...props.modalProps} />) ||
        <WelcomeModal {...props.modalProps} />
      }
    </div>
  )
}

export default WelcomeView
