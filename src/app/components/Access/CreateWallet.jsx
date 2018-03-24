import React from 'react'

import withToggle from 'Hoc/withToggle'
import CoinIcon from 'Components/CoinIcon'
import CreateWalletModal from 'Components/CreateWalletModal'

import AccessTile from './AccessTile'

const CreateWallet = ({ isModalOpen, toggleModalOpen }) => (
  <div>
    <AccessTile onClick={toggleModalOpen}>
      <h5 className='text-primary'><i className='fa fa-plus mr-2'/>Create wallet</h5>
      <h6>Generate a new keystore file</h6>
      <CoinIcon symbol='ETH' size={3} className='m-2'/>
    </AccessTile>
    <CreateWalletModal isNewWallet showModal={isModalOpen} toggleModal={toggleModalOpen} />
  </div>
)

export default withToggle('modalOpen')(CreateWallet)
