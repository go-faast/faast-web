import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Redirect } from 'react-router-dom'
import { push } from 'react-router-redux'

import toastr from 'Utilities/toastrWrapper'
import { getSwapStatus } from 'Utilities/swap'

import { getCurrentWalletWithHoldings, isDefaultPortfolioEmpty, getAllSwapsArray } from 'Selectors'
import { clearAllIntervals, updateHoldings, removePortfolio } from 'Actions/portfolio'
import { toggleOrderModal } from 'Actions/redux'
import { resetSwaps } from 'Actions/swap'
import { removeSwundle } from 'Actions/request'

import DashboardView from './view'

let balancesInterval

class Dashboard extends Component {
  constructor (props) {
    super(props)
    this._orderStatus = this._orderStatus.bind(this)
    this._forgetOrder = this._forgetOrder.bind(this)
    this._updateHoldings = this._updateHoldings.bind(this)
    this._removeWallet = this._removeWallet.bind(this)
  }

  componentWillMount () {
    balancesInterval = window.setInterval(this._updateHoldings, 30000)
    const { wallet } = this.props
    if (!(wallet.balancesLoaded && wallet.balancesUpdating)) {
      this._updateHoldings()
    }
  }

  componentWillUnmount () {
    window.clearInterval(balancesInterval)
    if (!this.props.wallet.isReadOnly) {
      const orderStatus = this._orderStatus()
      if (orderStatus === 'error' || orderStatus === 'complete') {
        this.props.resetSwaps()
        this.props.removeSwundle(this.props.wallet.id)
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

  _forgetOrder () {
    toastr.confirm(null, {
      component: () => (
        <div style={{ padding: 10, color: 'black' }}>
          Please be aware that <strong>forget</strong> does not actually cancel an order, it justs stops the browser app from tracking the status of the order. The order may still process normally. Please only proceed if you have been instructed to do so, or you understand the effects.
        </div>
      ),
      onOk: () => {
        clearAllIntervals()
        this.props.resetSwaps()
        this.props.removeSwundle(this.props.wallet.address)
      }
    })
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
        handleToggleOrderModal={this.props.toggleOrderModal}
        handleForgetOrder={this._forgetOrder}
        handleRemove={this._removeWallet}
        orderStatus={orderStatus}
        viewOnly={isViewOnly}
        disableRemove={disableRemove}
        isDefaultPortfolioEmpty={isDefaultPortfolioEmpty}
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
  toggleOrderModal,
  resetSwaps,
  removeSwundle,
  removePortfolio
}

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard)
