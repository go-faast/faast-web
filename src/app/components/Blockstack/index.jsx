import React, { Component } from 'react'
import { connect } from 'react-redux'
import toastr from 'Utilities/toastrWrapper'
import { filterUrl } from 'Utilities/helpers'
import blockstack from 'Utilities/blockstack'
import { openWallet } from 'Actions/portfolio'
import BlockstackView from './view'

class Blockstack extends Component {
  constructor () {
    super()
    this._handleClick = this._handleClick.bind(this)
  }

  _handleClick () {
    if (!blockstack.isUserSignedIn()) {
      blockstack.redirectToSignIn(filterUrl())
    } else {
      const wallet = blockstack.createWallet()
      if (wallet) {
        this.props.openWallet(wallet)
      } else {
        toastr.error('Unable to open Blockstack wallet')
      }
    }
  }

  render () {
    return (
      <BlockstackView handleClick={this._handleClick} />
    )
  }
}

const mapStateToProps = () => ({})

const mapDispatchToProps = (dispatch) => ({
  openWallet: (wallet) => {
    dispatch(openWallet(wallet))
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(Blockstack)
