import React from 'react'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'

import { closeWallet } from 'Actions/portfolio'
import { getCurrentWallet } from 'Selectors'

import WelcomeModalView from './view'

const WelcomeModal = (props) => (
  <WelcomeModalView address={props.wallet.address} handleClose={props.closeWallet} {...props} />
)

const mapStateToProps = createStructuredSelector({
  wallet: getCurrentWallet
})

const mapDispatchToProps = {
  closeWallet
}

export default connect(mapStateToProps, mapDispatchToProps)(WelcomeModal)
