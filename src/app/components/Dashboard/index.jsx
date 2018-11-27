import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Redirect, withRouter } from 'react-router-dom'
import { createStructuredSelector } from 'reselect'

import {
  getCurrentWalletWithHoldings, isDefaultPortfolioEmpty,
} from 'Selectors'
import { updateAllHoldings, removePortfolio, defaultPortfolioId } from 'Actions/portfolio'

import DashboardView from './view'

class Dashboard extends Component {
  constructor (props) {
    super(props)
    this._removeWallet = this._removeWallet.bind(this)
  }

  componentWillMount () {
    const { updateAllHoldings } = this.props
    const balancesInterval = window.setInterval(updateAllHoldings, 30000)
    this.setState({ balancesInterval })
    const { wallet } = this.props
    if (!(wallet.balancesLoaded && wallet.balancesUpdating)) {
      updateAllHoldings()
    }
  }

  componentWillUnmount () {
    window.clearInterval(this.state.balancesInterval)
  }

  _removeWallet () {
    const { wallet, removePortfolio } = this.props
    removePortfolio(wallet.id)
  }

  render () {
    const { wallet, isDefaultPortfolioEmpty } = this.props
    const isViewOnly = wallet.isReadOnly

    if (isDefaultPortfolioEmpty && !isViewOnly) {
      return (<Redirect to='/connect'/>)
    }

    const disableRemove = wallet.id === defaultPortfolioId
    return (
      <DashboardView
        wallet={wallet}
        handleRemove={this._removeWallet}
        viewOnly={isViewOnly}
        disableRemove={disableRemove}
        isDefaultPortfolioEmpty={isDefaultPortfolioEmpty}
        {...this.props}
      />
    )
  }
}

const mapStateToProps = createStructuredSelector({
  wallet: getCurrentWalletWithHoldings,
  isDefaultPortfolioEmpty: isDefaultPortfolioEmpty,
})

const mapDispatchToProps = {
  updateAllHoldings,
  removePortfolio
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Dashboard))
