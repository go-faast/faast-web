import React, { Component } from 'react'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import toastr from 'Utilities/toastrWrapper'
import { filterUrl } from 'Utilities/helpers'
import blockstack from 'Utilities/blockstack'
import { openWallet } from 'Actions/portfolio'

import AccessTile from 'Components/AccessTile'
import blockstackLogo from 'Img/blockstack-logo.png'

class Blockstack extends Component {
  constructor () {
    super()
    this._handleClick = this._handleClick.bind(this)
  }

  _handleClick () {
    const { openWallet, routerPush } = this.props
    if (!blockstack.isUserSignedIn()) {
      blockstack.redirectToSignIn(filterUrl())
    } else {
      const wallet = blockstack.createWallet()
      if (wallet) {
        openWallet(wallet)
          .then(() => routerPush('/balances'))
      } else {
        toastr.error('Unable to open Blockstack wallet')
      }
    }
  }

  render () {
    return (
      <AccessTile name='Blockstack' icon={blockstackLogo} onClick={this._handleClick}/>
    )
  }
}

const mapStateToProps = () => ({})

const mapDispatchToProps = {
  openWallet,
  routerPush: push
}

export default connect(mapStateToProps, mapDispatchToProps)(Blockstack)
