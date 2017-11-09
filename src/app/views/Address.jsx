import React from 'react'
import PropTypes from 'prop-types'
import AddressModalController from 'Controllers/AddressModalController'

const Address = (props) => {
  return (
    <div>
      <span onClick={props.handleClick} className={props.className}>{props.address}</span>
      <AddressModalController {...props.modalProps} />
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
