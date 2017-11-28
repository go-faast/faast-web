import React from 'react'
import WelcomeModalController from 'Controllers/WelcomeModalController'
import CreateWalletModalController from 'Controllers/CreateWalletModalController'

const Welcome = (props) => {
  return (
    <div>
      {(props.view === 'downloadKeystore' &&
        <CreateWalletModalController {...props.modalProps} />) ||
        <WelcomeModalController {...props.modalProps} />
      }
    </div>
  )
}

export default Welcome
