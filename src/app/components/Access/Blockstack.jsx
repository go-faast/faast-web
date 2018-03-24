import React from 'react'
import { connect } from 'react-redux'

import blockstackLogo from 'Img/blockstack-logo.png'

import { openBlockstackWallet } from 'Actions/access'

import AccessTile from './AccessTile'

const Blockstack = ({ handleClick }) => (
  <AccessTile name='Blockstack' icon={blockstackLogo} onClick={handleClick}/>
)

const mapDispatchToProps = {
  handleClick: openBlockstackWallet
}

export default connect(null, mapDispatchToProps)(Blockstack)
