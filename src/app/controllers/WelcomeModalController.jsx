import React from 'react'
import { connect } from 'react-redux'
import WelcomeModal from 'Views/WelcomeModal'
import { closeWallet } from 'Actions/portfolio'

const WelcomeModalController = (props) => (
  <WelcomeModal address={props.wallet.address} handleClose={props.closeWallet} {...props} />
)

const mapStateToProps = (state) => ({
  wallet: state.wallet
})

const mapDispatchToProps = (dispatch) => ({
  closeWallet: () => {
    dispatch(closeWallet())
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(WelcomeModalController)
