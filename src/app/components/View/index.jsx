import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { replace } from 'react-router-redux'
import { connect } from 'react-redux'
import Balances from 'Components/Balances'
import { isValidAddress } from 'Utilities/wallet'
import { toChecksumAddress } from 'Utilities/convert'
import toastr from 'Utilities/toastrWrapper'
import { createViewOnlyPortfolio, removePortfolio, setCurrentPortfolio } from 'Actions/portfolio'

class View extends Component {
  constructor () {
    super()
    this.state = { portfolioId: '' }
    this._setAddress = this._setAddress.bind(this)
  }

  componentWillMount () {
    this._setAddress(this.props.match.params.address)
  }

  componentWillUnmount () {
    this.props.removePortfolio(this.state.portfolioId)
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
      this.props.createViewOnlyPortfolio(toChecksumAddress(address))
        .then(({ id }) => {
          this.props.setCurrentPortfolio(id)
          this.setState({ portfolioId: id })
        })
    }
  }

  render () {
    if (!this.state.portfolioId) return null

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
