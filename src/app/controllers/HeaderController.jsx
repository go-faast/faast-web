import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import Header from 'Views/Header'
import { sessionStorageClear } from 'Utilities/helpers'
import log from 'Utilities/log'
import { resetAll, toggleOrderModal } from 'Actions/redux'

const HeaderController = (props) => {
  const handleModify = (e) => {
    if (!props.disableAction) {
      props.handleModify(e)
    }
  }
  const closeWallet = () => {
    sessionStorageClear()
    props.resetAll()
    log.info('wallet closed')
  }

  return (
    <Header
      {...props}
      handleModify={handleModify}
      handleCloseWallet={closeWallet}
    />
  )
}

HeaderController.propTypes = {
  disableAction: PropTypes.bool,
  resetAll: PropTypes.func.isRequired
}

const mapStateToProps = (state) => ({
  swap: state.swap
})

const mapDispatchToProps = (dispatch) => ({
  resetAll: () => {
    dispatch(resetAll())
  },
  toggleOrderModal: () => {
    dispatch(toggleOrderModal())
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(HeaderController)
