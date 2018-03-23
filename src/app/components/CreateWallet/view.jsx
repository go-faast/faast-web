import React from 'react'
import PropTypes from 'prop-types'
import CreateWalletModal from 'Components/CreateWalletModal'
import AccessTile from 'Components/AccessTile'
import CoinIcon from 'Components/CoinIcon'

const CreateWalletView = ({ handleClick, modalProps }) => (
  <div>
    <AccessTile onClick={handleClick}>
      <h5 className='text-primary'><i className='fa fa-plus mr-2'/>Create wallet</h5>
      <h6>Generate a new keystore file</h6>
      <CoinIcon symbol='ETH' size={3} className='m-2'/>
    </AccessTile>
    <CreateWalletModal {...modalProps} />
  </div>
)

CreateWalletView.propTypes = {
  handleClick: PropTypes.func.isRequired,
  modalProps: PropTypes.shape({
    showModal: PropTypes.bool,
    toggleModal: PropTypes.func.isRequired
  })
}

export default CreateWalletView
