import React from 'react'
import PropTypes from 'prop-types'
import AddressModal from 'Components/AddressModal'
import CreateWalletModal from 'Components/CreateWalletModal'

const AddressView = (props) => {
  return (
    <div>
      <span onClick={props.handleClick} className={props.className}>{props.address}</span>
      {(props.view === 'downloadKeystore' &&
        <CreateWalletModal {...props.modalProps} />) ||
        <AddressModal {...props.modalProps} />
      }
    </div>
  )
}

AddressView.propTypes = {
  handleClick: PropTypes.func.isRequired,
  modalProps: PropTypes.shape({
    showModal: PropTypes.bool,
    toggleModal: PropTypes.func
  })
}

export default AddressView
