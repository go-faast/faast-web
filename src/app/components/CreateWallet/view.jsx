import React from 'react'
import PropTypes from 'prop-types'
import CreateWalletModal from 'Components/CreateWalletModal'
import AccessTile from 'Components/AccessTile'

const CreateWalletView = (props) => {
  return (
    <AccessTile outline color='primary' onClick={props.handleClick}>
      <i className='fa fa-plus fa-3x'/>
      <h5 className='pt-3'>create a new wallet</h5>
      <CreateWalletModal {...props.modalProps} />
    </AccessTile>
  )
}

CreateWalletView.propTypes = {
  handleClick: PropTypes.func.isRequired,
  modalProps: PropTypes.shape({
    showModal: PropTypes.bool,
    toggleModal: PropTypes.func.isRequired
  })
}

export default CreateWalletView
