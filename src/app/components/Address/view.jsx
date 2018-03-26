import React from 'react'
import PropTypes from 'prop-types'
import AddressModal from 'Components/AddressModal'
import CreateWalletModal from 'Components/CreateWalletModal'
import { Button } from 'reactstrap'
import classNames from 'class-names'

import style from './style'

const AddressView = ({ address, handleClick, className, view, modalProps }) => {
  return address ? (
    <div>
      <Button color='link-plain' onClick={handleClick} className={classNames(className, style.addressButton)}>
        {address}
      </Button>
      {(view === 'downloadKeystore' &&
        <CreateWalletModal {...modalProps} />) ||
        (<AddressModal address={address} {...modalProps} />)
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
