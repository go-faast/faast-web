import React from 'react'
import PropTypes from 'prop-types'
import AddressModal from 'Components/AddressModal'
import CreateWalletModal from 'Components/CreateWalletModal'
import { Button } from 'reactstrap'
import classNames from 'class-names'

const AddressView = (props) => {
  return props.address ? (
    <div>
      <Button color='link' onClick={props.handleClick} className={classNames(props.className, 'p-0')}>{props.address}</Button>
      {(props.view === 'downloadKeystore' &&
        <CreateWalletModal {...props.modalProps} />) ||
        (<AddressModal address={props.address} {...props.modalProps} />)
      }
    </div>
  ) : null
}

AddressView.propTypes = {
  address: PropTypes.string,
  handleClick: PropTypes.func.isRequired,
  modalProps: PropTypes.shape({
    showModal: PropTypes.bool,
    toggleModal: PropTypes.func
  })
}

export default AddressView
