import React from 'react'

import withToggle from 'Hoc/withToggle'
import CoinIcon from 'Components/CoinIcon'
import CreateWalletModal from 'Components/CreateWalletModal'
import T from 'Components/i18n/T'

import AccessTile from './AccessTile'

const CreateWallet = ({ isModalOpen, toggleModalOpen }) => (
  <div>
    <AccessTile onClick={toggleModalOpen}>
      <T tag='h5' i18nKey='app.access.createWallet.create' className='text-primary'>
        <i className='fa fa-plus mr-2'/>Create wallet
      </T>
      <T tag='h6' i18nKey='app.access.createWallet.generate'>Generate a new keystore file</T>
      <CoinIcon symbol='ETH' size={3} className='m-2'/>
    </AccessTile>
    <CreateWalletModal isNewWallet showModal={isModalOpen} toggleModal={toggleModalOpen} />
  </div>
)

export default withToggle('modalOpen')(CreateWallet)
