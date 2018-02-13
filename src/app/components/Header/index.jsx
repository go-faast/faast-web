import React from 'react'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import PropTypes from 'prop-types'
import HeaderView from './view'
import { toggleOrderModal } from 'Actions/redux'
import { closeCurrentPortfolio } from 'Actions/portfolio'
import { isValidAddress } from 'Utilities/wallet'
import toastr from 'Utilities/toastrWrapper'
import { isCurrentPortfolioEmpty } from 'Selectors'

const Header = (props) => {
  const handleModify = (e) => {
    if (!props.disableAction) {
      props.handleModify(e)
    }
  }

  const handleAddressSearch = (values) => {
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
      handleCloseWallet={props.closeCurrentPortfolio}
    />
  )
}

Header.propTypes = {
  disableAction: PropTypes.bool,
  closeCurrentPortfolio: PropTypes.func.isRequired,
  toggleOrderModal: PropTypes.func.isRequired
}

const mapStateToProps = (state) => ({
  swap: state.swap,
  isPortfolioEmpty: isCurrentPortfolioEmpty(state),
})

const mapDispatchToProps = {
  closeCurrentPortfolio,
  toggleOrderModal,
  historyPush: push,
}

export default connect(mapStateToProps, mapDispatchToProps)(Header)
