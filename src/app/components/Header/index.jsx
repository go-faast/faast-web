import React from 'react'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import PropTypes from 'prop-types'
import HeaderView from './view'
import { toggleOrderModal } from 'Actions/redux'
import { closeWallet } from 'Actions/portfolio'
import { isValidAddress } from 'Utilities/wallet'
import toastr from 'Utilities/toastrWrapper'
import { getCurrentWallet } from 'Selectors'

const Header = (props) => {
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
    <HeaderView
      {...props}
      handleModify={handleModify}
      handleAddressSearch={handleAddressSearch}
      handleCloseWallet={props.closeWallet}
      isWalletAccessed={!!props.wallet.address}
    />
  )
}

Header.propTypes = {
  disableAction: PropTypes.bool,
  closeWallet: PropTypes.func.isRequired,
  toggleOrderModal: PropTypes.func.isRequired
}

const mapStateToProps = (state) => ({
  swap: state.swap,
  wallet: getCurrentWallet(state)
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

export default connect(mapStateToProps, mapDispatchToProps)(Header)
