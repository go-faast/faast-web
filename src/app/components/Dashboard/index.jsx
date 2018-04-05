import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Redirect } from 'react-router-dom'
import { push } from 'react-router-redux'

import { getSwapStatus } from 'Utilities/swap'

import { getCurrentWalletWithHoldings, isDefaultPortfolioEmpty, getAllSwapsArray } from 'Selectors'
import { updateHoldings, removePortfolio } from 'Actions/portfolio'
import { forgetCurrentOrder } from 'Actions/swap'

import DashboardView from './view'

class Dashboard extends Component {
  constructor (props) {
    super(props)
    this._orderStatus = this._orderStatus.bind(this)
    this._updateHoldings = this._updateHoldings.bind(this)
    this._removeWallet = this._removeWallet.bind(this)
  }

  componentWillMount () {
    const balancesInterval = window.setInterval(this._updateHoldings, 30000)
    this.setState({ balancesInterval })
    const { wallet } = this.props
    if (!(wallet.balancesLoaded && wallet.balancesUpdating)) {
      this._updateHoldings()
    }
  }

  componentWillUnmount () {
    window.clearInterval(this.state.balancesInterval)
    if (!this.props.wallet.isReadOnly) {
      const orderStatus = this._orderStatus()
      if (orderStatus === 'error' || orderStatus === 'complete') {
        this.props.forgetCurrentOrder()
      }
    }
  }

  _updateHoldings () {
    const { updateHoldings, wallet } = this.props
    updateHoldings(wallet.id)
  }

  _orderStatus () {
    const { swaps } = this.props
    if (!swaps.length) return false

    const statuses = swaps.map(getSwapStatus).map(({ status }) => status)
    if (statuses.includes('working')) return 'working'
    if (statuses.includes('error')) return 'error'
    return 'complete'
  }

  _removeWallet () {
    const { wallet, removePortfolio } = this.props
    removePortfolio(wallet.id)
  }

  render () {
    const orderStatus = this._orderStatus()

    const { wallet, isDefaultPortfolioEmpty } = this.props
    const isViewOnly = wallet.isReadOnly

    if (isDefaultPortfolioEmpty && !isViewOnly) {
      return (<Redirect to='/connect'/>)
    }

    const disableRemove = wallet.id === 'default'
    return (
      <DashboardView
        wallet={wallet}
        showOrderModal={this.props.orderModal.show}
        handleRemove={this._removeWallet}
        orderStatus={orderStatus}
        viewOnly={isViewOnly}
        disableRemove={disableRemove}
        isDefaultPortfolioEmpty={isDefaultPortfolioEmpty}
        {...this.props}
      />
    )
  }
}

Dashboard.propTypes = {
  wallet: PropTypes.object.isRequired,
  updateHoldings: PropTypes.func.isRequired,
  routerPush: PropTypes.func.isRequired
}

const mapStateToProps = (state) => ({
  wallet: getCurrentWalletWithHoldings(state),
  isDefaultPortfolioEmpty: isDefaultPortfolioEmpty(state),
  swaps: getAllSwapsArray(state),
  orderModal: state.orderModal,
})

const mapDispatchToProps = {
  updateHoldings,
  routerPush: push,
  forgetCurrentOrder,
  removePortfolio
}

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard)
