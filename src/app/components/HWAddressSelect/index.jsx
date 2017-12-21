import React, { Component } from 'react'
import HWAddressSelectView from './view'
import toastr from 'Utilities/toastrWrapper'

class HWAddressSelect extends Component {
  constructor () {
    super()
    this.state = {
      showPathInput: false
    }
    this._handleAddressSubmit = this._handleAddressSubmit.bind(this)
    this._handleIncreaseIxGroup = this._handleIncreaseIxGroup.bind(this)
    this._handleDecreaseIxGroup = this._handleDecreaseIxGroup.bind(this)
    this._handleShowPathInput = this._handleShowPathInput.bind(this)
    this._handlePathSubmit = this._handlePathSubmit.bind(this)
  }

  _handleAddressSubmit () {
    if (this.props.addressIxSelected == null) {
      return toastr.error('Please select the address to use for the portfolio')
    }
    this.props.handleChooseAddress(parseInt(this.props.addressIxSelected))
  }

  _handleIncreaseIxGroup () {
    this.props.handleChangeAddressIxGroup(1)
  }

  _handleDecreaseIxGroup () {
    this.props.handleChangeAddressIxGroup(-1)
  }

  _handleShowPathInput () {
    this.setState({ showPathInput: true })
  }

  _handlePathSubmit (values) {
    this.setState({ showPathInput: false })
    this.props.handleChangeDerivationPath(values.derivationPath)
  }

  render () {
    const addresses = this.props.addresses.filter((a, i) => {
      return i >= this.props.startIndex && i <= this.props.endIndex
    })

    return (
      <HWAddressSelectView
        {...this.props}
        addresses={addresses}
        showDecreaseIxGroup={this.props.startIndex > 0}
        handleIncreaseIxGroup={this._handleIncreaseIxGroup}
        handleDecreaseIxGroup={this._handleDecreaseIxGroup}
        showPathInput={this.state.showPathInput}
        handleShowPathInput={this._handleShowPathInput}
        pathInitialValues={{ derivationPath: this.props.derivationPath }}
        handlePathSubmit={this._handlePathSubmit}
        handleAddressSubmit={this._handleAddressSubmit}
      />
    )
  }
}

export default HWAddressSelect
