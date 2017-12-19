import React from 'react'
import PropTypes from 'prop-types'
import AddressModalController from 'Controllers/AddressModalController'
import CreateWalletModalController from 'Controllers/CreateWalletModalController'

const Address = (props) => {
  let address = props.tablet? props.address : 'reveal address'
  return (
    <div>
      <span onClick={props.handleClick} className={props.className}>{address}</span>
      {(props.view === 'downloadKeystore' &&
        <CreateWalletModalController {...props.modalProps} />) ||
        <AddressModalController {...props.modalProps} />
      }
    </div>
  )
}

Address.propTypes = {
  handleClick: PropTypes.func.isRequired,
  modalProps: PropTypes.shape({
    showModal: PropTypes.bool,
    toggleModal: PropTypes.func
  })
}

export default Address
