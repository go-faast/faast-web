import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import Header from 'Views/Header'
import { toggleOrderModal } from 'Actions/redux'
import { closeWallet } from 'Actions/portfolio'

const HeaderController = (props) => {
  const handleModify = (e) => {
    if (!props.disableAction) {
      props.handleModify(e)
    }
  }

  return (
    <Header
      {...props}
      handleModify={handleModify}
      handleCloseWallet={props.closeWallet}
    />
  )
}

HeaderController.propTypes = {
  disableAction: PropTypes.bool,
  closeWallet: PropTypes.func.isRequired,
  toggleOrderModal: PropTypes.func.isRequired
}

const mapStateToProps = (state) => ({
  swap: state.swap
})

const mapDispatchToProps = (dispatch) => ({
  closeWallet: () => {
    dispatch(closeWallet())
  },
  toggleOrderModal: () => {
    dispatch(toggleOrderModal())
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(HeaderController)
