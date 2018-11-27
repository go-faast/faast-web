import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { Redirect, withRouter } from 'react-router-dom'
import { createStructuredSelector } from 'reselect'

import {
  getCurrentWalletWithHoldings, isDefaultPortfolioEmpty,
  isLatestSwundleSummaryShowing, isAppBlocked
} from 'Selectors'
import { updateAllHoldings, removePortfolio, defaultPortfolioId } from 'Actions/portfolio'

import Blocked from 'Components/Blocked'
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
    const { wallet, isDefaultPortfolioEmpty, blocked } = this.props
    const isViewOnly = wallet.isReadOnly

    if (isDefaultPortfolioEmpty && !isViewOnly) {
      return (<Redirect to='/connect'/>)
    }

    const disableRemove = wallet.id === defaultPortfolioId
    return (
      <Fragment>
        {blocked ? (
          <Blocked/>
        ) : null}
        <DashboardView
          wallet={wallet}
          handleRemove={this._removeWallet}
          viewOnly={isViewOnly}
          disableRemove={disableRemove}
          isDefaultPortfolioEmpty={isDefaultPortfolioEmpty}
          {...this.props}
        />
      </Fragment>
    )
  }
}

const mapStateToProps = createStructuredSelector({
  wallet: getCurrentWalletWithHoldings,
  isDefaultPortfolioEmpty: isDefaultPortfolioEmpty,
  showOrderStatus: isLatestSwundleSummaryShowing,
  blocked: isAppBlocked,
})

const mapDispatchToProps = {
  updateAllHoldings,
  removePortfolio
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Dashboard))
