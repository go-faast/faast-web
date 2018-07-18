import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Redirect } from 'react-router-dom'
import { createStructuredSelector } from 'reselect'

import {
  getCurrentWalletWithHoldings, isDefaultPortfolioEmpty,
  getCurrentSwundleStatus
} from 'Selectors'
import { updateAllHoldings, removePortfolio, defaultPortfolioId } from 'Actions/portfolio'
import { forgetCurrentOrder } from 'Actions/swap'

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
    const { wallet, forgetCurrentOrder, orderStatus } = this.props
    if (!wallet.isReadOnly) {
      if (orderStatus === 'complete') {
        forgetCurrentOrder()
      }
    }
  }

  _removeWallet () {
    const { wallet, removePortfolio } = this.props
    removePortfolio(wallet.id)
  }

  render () {
    const { wallet, isDefaultPortfolioEmpty, orderStatus } = this.props
    const isViewOnly = wallet.isReadOnly

    if (isDefaultPortfolioEmpty && !isViewOnly) {
      return (<Redirect to='/connect'/>)
    }

    const disableRemove = wallet.id === defaultPortfolioId
    const showOrderStatus = Boolean(orderStatus)
    return (
      <DashboardView
        wallet={wallet}
        handleRemove={this._removeWallet}
        viewOnly={isViewOnly}
        disableRemove={disableRemove}
        showOrderStatus={showOrderStatus}
        isDefaultPortfolioEmpty={isDefaultPortfolioEmpty}
        {...this.props}
      />
    )
  }
}

const mapStateToProps = createStructuredSelector({
  wallet: getCurrentWalletWithHoldings,
  isDefaultPortfolioEmpty: isDefaultPortfolioEmpty,
  orderStatus: getCurrentSwundleStatus,
})

const mapDispatchToProps = {
  updateAllHoldings,
  forgetCurrentOrder,
  removePortfolio
}

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard)
