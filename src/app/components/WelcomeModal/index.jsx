import React from 'react'
import { connect } from 'react-redux'
import WelcomeModalView from './view'
import { closeWallet } from 'Actions/portfolio'
import { getCurrentWallet } from 'Selectors'

const WelcomeModal = (props) => (
  <WelcomeModalView address={props.wallet.address} handleClose={props.closeWallet} {...props} />
)

const mapStateToProps = (state) => ({
  wallet: getCurrentWallet(state)
})

const mapDispatchToProps = (dispatch) => ({
  closeWallet: () => {
    dispatch(closeWallet())
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(WelcomeModal)
