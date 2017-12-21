import React, { Component } from 'react'
import { replace } from 'react-router-redux'
import { connect } from 'react-redux'
import Balances from 'Components/Balances'
import { isValidAddress } from 'Utilities/wallet'
import { toChecksumAddress } from 'Utilities/convert'
import toastr from 'Utilities/toastrWrapper'
import { setWallet, resetPortfolio } from 'Actions/redux'

class View extends Component {
  constructor () {
    super()
    this.state = { address: '' }
    this._setAddress = this._setAddress.bind(this)
  }

  componentWillMount () {
    this._setAddress(this.props.match.params.address)
    this.props.resetPortfolio()
  }

  componentWillUnmount () {
    this.props.resetPortfolio()
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.match.params.address !== this.props.match.params.address) {
      this._setAddress(nextProps.match.params.address)
    }
  }

  _setAddress (address) {
    if (!isValidAddress(address)) {
      toastr.error('Not a valid address')
      this.props.historyReplace('/')
    } else {
      this.setState({ address: toChecksumAddress(address) })
    }
  }

  render () {
    if (!this.state.address) return null

    return <Balances viewOnlyAddress={this.state.address} />
  }
}

const mapStateToProps = () => ({})

const mapDispatchToProps = (dispatch) => ({
  historyReplace: (path) => {
    dispatch(replace(path))
  },
  setWallet: (type, address, data) => {
    dispatch(setWallet(type, address, data))
  },
  resetPortfolio: () => {
    dispatch(resetPortfolio())
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(View)
