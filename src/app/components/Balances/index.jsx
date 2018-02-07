import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import PieChart from 'Components/PieChart'
import PriceChart from 'Components/PriceChart'
import BalancesView from './view'
import toastr from 'Utilities/toastrWrapper'
import log from 'Utilities/log'
import { getSwapStatus } from 'Utilities/swap'
import { removeSwundle } from 'Actions/request'
import { toggleOrderModal, resetSwap } from 'Actions/redux'
import { clearAllIntervals, updateHoldings } from 'Actions/portfolio'
import { getCurrentPortfolioWithHoldings, getCurrentWallet } from 'Selectors'

let balancesInterval

class Balances extends Component {
  constructor (props) {
    super(props)
    this.state = {
      pieChartSelection: '',
      openCharts: {},
    }
    this._updateHoldings = this._updateHoldings.bind(this)
    this._toggleChart = this._toggleChart.bind(this)
    this._setChartSelect = this._setChartSelect.bind(this)
    this._orderStatus = this._orderStatus.bind(this)
    this._forgetOrder = this._forgetOrder.bind(this)
  }

  componentWillMount () {
    balancesInterval = window.setInterval(this._updateHoldings, 30000)
    this._updateHoldings()
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.portfolio.id && nextProps.portfolio.id !== this.props.portfolio.id) {
      this._updateHoldings()
    }
  }

  componentWillUnmount () {
    window.clearInterval(balancesInterval)
    if (!this.props.portfolio.viewOnly) {
      const orderStatus = this._orderStatus()
      if (orderStatus === 'error' || orderStatus === 'complete') {
        this.props.resetSwap()
        this.props.removeSwundle(this.props.wallet.id)
      }
    }
  }

  _updateHoldings () {
    this.props.updateHoldings(this.props.portfolio.id)
  }

  _toggleChart (symbol) {
    const { openCharts } = this.state
    this.setState({
      openCharts: {
        ...openCharts,
        [symbol]: !openCharts[symbol]
      }
    })
  }

  _setChartSelect (symbol) {
    this.setState({ pieChartSelection: symbol })
  }

  _orderStatus () {
    if (!this.props.swap.length) return false

    const statuses = this.props.swap.reduce((a, b) => {
      return a.concat(b.list.map(getSwapStatus).map(c => c.status))
    }, [])
    if (statuses.some(s => s === 'working')) return 'working'
    if (statuses.some(s => s === 'error')) return 'error'
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
        this.props.resetSwap()
        this.props.removeSwundle(this.props.wallet.address)
      }
    })
  }

  render () {
    const orderStatus = this._orderStatus()

    const { wallet, portfolio } = this.props
    const isViewOnly = portfolio.viewOnly
    const layoutProps = {
      showAction: true,
      showAddressSearch: true,
      view: isViewOnly ? 'view' : 'balances',
      disableAction: !portfolio || !portfolio.assetHoldings || !portfolio.assetHoldings.length || orderStatus === 'working',
      handleModify: () => this.props.routerPush('/modify'),
    }
    const addressProps = {
      address: wallet.address,
      showDownloadKeystore: !isViewOnly && wallet.isBlockstack
    }
    const totalDecrease = portfolio.totalChange.isNegative()
    return (
      <BalancesView
        pieChart={<PieChart portfolio={portfolio} selectedSymbol={this.state.pieChartSelection} handleChartSelect={this._setChartSelect} />}
        priceChart={<PriceChart />}
        layoutProps={layoutProps}
        mq={this.props.mq}
        total={portfolio.totalFiat}
        total24hAgo={portfolio.totalFiat24hAgo}
        totalChange={portfolio.totalChange}
        totalDecrease={totalDecrease}
        assetRows={portfolio.assetHoldings.filter((holding) => holding.shown)}
        toggleChart={this._toggleChart}
        showOrderModal={this.props.orderModal.show}
        handleToggleOrderModal={this.props.toggleOrderModal}
        handleForgetOrder={this._forgetOrder}
        orderStatus={orderStatus}
        addressProps={addressProps}
        viewOnly={isViewOnly}
        openCharts={this.state.openCharts}
      />
    )
  }
}

Balances.propTypes = {
  wallet: PropTypes.object.isRequired,
  portfolio: PropTypes.object.isRequired,
  mock: PropTypes.object.isRequired,
  updateHoldings: PropTypes.func.isRequired,
  routerPush: PropTypes.func.isRequired
}

const mapStateToProps = (state) => ({
  wallet: getCurrentWallet(state),
  portfolio: getCurrentPortfolioWithHoldings(state),
  mock: state.mock,
  orderModal: state.orderModal,
  swap: state.swap,
  mq: state.mediaQueries
})

const mapDispatchToProps = {
  updateHoldings,
  routerPush: push,
  toggleOrderModal,
  resetSwap,
  removeSwundle
}

export default connect(mapStateToProps, mapDispatchToProps)(Balances)
