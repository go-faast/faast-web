import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { Redirect, withRouter } from 'react-router-dom'
import { createStructuredSelector } from 'reselect'
import { Helmet } from 'react-helmet'
import {
  getCurrentWalletWithHoldings, isDefaultPortfolioEmpty
} from 'Selectors'
import { updateAllHoldings, removePortfolio, defaultPortfolioId } from 'Actions/portfolio'
import { doToggleFeedbackForm } from 'Actions/app'
import { retrieveAssets } from 'Actions/asset'

import DashboardView from './view'

class Dashboard extends Component {
  constructor (props) {
    super(props)
    this._removeWallet = this._removeWallet.bind(this)
  }

  componentDidMount () {
    const { updateAllHoldings, retrieveAssets } = this.props
    const balancesInterval = window.setInterval(updateAllHoldings, 180000)
    this.setState({ balancesInterval })
    const assetsInterval = window.setInterval(retrieveAssets, 300000)
    this.setState({ assetsInterval })
    const { wallet } = this.props
    if (Date.now() - wallet.balancesLastUpdated > 180000 && !wallet.balancesUpdating) {
      setTimeout(updateAllHoldings, 5000)
    }
  }

  componentWillUnmount () {
    window.clearInterval(this.state.balancesInterval)
    window.clearInterval(this.state.assetsInterval)
  }

  _removeWallet () {
    const { wallet, removePortfolio } = this.props
    removePortfolio(wallet.id)
  }

  render () {
    const { wallet, isDefaultPortfolioEmpty, doToggleFeedbackForm } = this.props
    const isViewOnly = wallet.isReadOnly
    if (isDefaultPortfolioEmpty && !isViewOnly) {
      return (<Redirect to='/connect'/>)
    }

    const disableRemove = wallet.id === defaultPortfolioId
    return (
      <Fragment>
        <Helmet>
          <title>Crypto Portfolio Dashboard - Faa.st</title>
          <meta name='description' content='Connect your cryptocurrency wallet and visualize your portfolio holdings with charts and graphs.' /> 
        </Helmet>
        <DashboardView
          wallet={wallet}
          handleRemove={this._removeWallet}
          viewOnly={isViewOnly}
          disableRemove={disableRemove}
          isDefaultPortfolioEmpty={isDefaultPortfolioEmpty}
          doToggleFeedbackForm={doToggleFeedbackForm}
          {...this.props}
        />
      </Fragment>
    )
  }
}

const mapStateToProps = createStructuredSelector({
  wallet: getCurrentWalletWithHoldings,
  isDefaultPortfolioEmpty: isDefaultPortfolioEmpty,
})

const mapDispatchToProps = {
  updateAllHoldings,
  removePortfolio,
  retrieveAssets,
  doToggleFeedbackForm,
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Dashboard))
