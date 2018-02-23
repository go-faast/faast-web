import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { replace } from 'react-router-redux'
import { connect } from 'react-redux'
import Balances from 'Components/Balances'
import { isValidAddress } from 'Utilities/wallet'
import { toChecksumAddress } from 'Utilities/convert'
import toastr from 'Utilities/toastrWrapper'
import { createViewOnlyPortfolio, setCurrentPortfolio, removePortfolio } from 'Actions/portfolio'
import LoadingFullscreen from 'Components/LoadingFullscreen'

class View extends Component {
  constructor () {
    super()
    this.state = { walletId: '', removeOnUnmount: false }
    this._setAddress = this._setAddress.bind(this)
  }

  componentWillMount () {
    this._setAddress(this.props.match.params.address)
  }

  componentWillUnmount () {
    const { removePortfolio } = this.props
    const { walletId, removeOnUnmount } = this.state
    if (removeOnUnmount) {
      removePortfolio(walletId)
    }
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
      this.props.createViewOnlyPortfolio(toChecksumAddress(address), true)
        .then(({ id, isReadOnly }) => {
          this.setState({ walletId: id, removeOnUnmount: isReadOnly })
        })
    }
  }

  render () {
    if (!this.state.walletId) return (<LoadingFullscreen/>)

    return <Balances />
  }
}

View.propTypes = {
  match: PropTypes.object.isRequired,
}

const mapStateToProps = () => ({})

const mapDispatchToProps = {
  historyReplace: replace,
  createViewOnlyPortfolio,
  removePortfolio,
  setCurrentPortfolio,
}

export default connect(mapStateToProps, mapDispatchToProps)(View)
