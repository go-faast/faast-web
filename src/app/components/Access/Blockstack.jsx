import React from 'react'
import { connect } from 'react-redux'

import config from 'Config'
import { openBlockstackWallet } from 'Actions/access'

import AccessTile from './AccessTile'

const Blockstack = ({ handleClick }) => (
  <AccessTile name='Blockstack' icon={config.walletTypes.blockstack.icon} onClick={handleClick}/>
)

const mapDispatchToProps = {
  handleClick: openBlockstackWallet
}

export default connect(null, mapDispatchToProps)(Blockstack)
