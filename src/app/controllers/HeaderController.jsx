import React from 'react'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import PropTypes from 'prop-types'
import Header from 'Views/Header'
import { toggleOrderModal } from 'Actions/redux'
import { closeWallet } from 'Actions/portfolio'
import { isValidAddress } from 'Utilities/wallet'
import toastr from 'Utilities/toastrWrapper'

const HeaderController = (props) => {
  const handleModify = (e) => {
    if (!props.disableAction) {
      props.handleModify(e)
    }
  }

  const handleAddressSearch = (values, dispatch) => {
    const address = typeof values.address === 'string' ? values.address.trim() : ''
    if (!isValidAddress(address)) {
      toastr.error('Not a valid address')
    } else {
      props.historyPush(`/address/${address}`)
    }
  }

  return (
    <Header
      {...props}
      handleModify={handleModify}
      handleAddressSearch={handleAddressSearch}
      handleCloseWallet={props.closeWallet}
      isWalletAccessed={!!props.wallet.address}
    />
  )
}

HeaderController.propTypes = {
  disableAction: PropTypes.bool,
  closeWallet: PropTypes.func.isRequired,
  toggleOrderModal: PropTypes.func.isRequired
}

const mapStateToProps = (state) => ({
  swap: state.swap,
  wallet: state.wallet
})

const mapDispatchToProps = (dispatch) => ({
  closeWallet: () => {
    dispatch(closeWallet())
  },
  toggleOrderModal: () => {
    dispatch(toggleOrderModal())
  },
  historyPush: (path) => {
    dispatch(push(path))
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(HeaderController)
