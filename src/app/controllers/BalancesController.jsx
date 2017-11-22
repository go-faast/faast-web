import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import PieChartController from 'Controllers/PieChartController'
import PriceChartController from 'Controllers/PriceChartController'
import Balances from 'Views/Balances'
import log from 'Utilities/log'
import { updateObjectInArray } from 'Utilities/helpers'
import { getSwapStatus } from 'Utilities/swap'
import { clearSwap } from 'Utilities/storage'
import { getBalances } from 'Actions/request'
import { toggleOrderModal, resetSwap } from 'Actions/redux'

let balancesInterval

class BalancesController extends Component {
  constructor () {
    super()
    this.state = {
      list: [],
      chartSelect: {}
    }
    this._getBalances = this._getBalances.bind(this)
    this._toggleChart = this._toggleChart.bind(this)
    this._setChartSelect = this._setChartSelect.bind(this)
    this._assetRows = this._assetRows.bind(this)
    this._setList = this._setList.bind(this)
    this._orderStatus = this._orderStatus.bind(this)
  }

  componentWillMount () {
    balancesInterval = window.setInterval(this._getBalances, 30000)
    this._setList()
    this._getBalances()
  }

  componentWillUnmount () {
    window.clearInterval(balancesInterval)
    const orderStatus = this._orderStatus()
    if (orderStatus === 'error' || orderStatus === 'complete') {
      this.props.resetSwap()
      clearSwap(this.props.wallet.address)
    }
  }

  _setList () {
    const list = this.props.portfolio.list.map((a, i) => {
      if (a.shown) {
        return {
          name: a.name,
          symbol: a.symbol,
          units: a.balance,
          weight: a.percentage,
          price: a.price,
          value: a.fiat,
          change: a.change24,
          infoUrl: a.infoUrl,
          priceDecrease: a.change24.isNegative(),
          chartOpen: false
        }
      }
    }).filter(a => a)
    this.setState({ list })
  }

  _getBalances () {
    this.props.getBalances(this.props.assets, this.props.portfolio, this.props.wallet.address, this.props.mock)
    .then(() => {
      this._setChartSelect('ETH')
      this._setList()
    })
    .catch(log.error)
  }

  _toggleChart (symbol) {
    const assetIx = this.state.list.findIndex(a => a.symbol === symbol)
    if (assetIx >= 0) {
      this.setState({
        list: updateObjectInArray(this.state.list, {
          index: assetIx,
          item: Object.assign({}, this.state.list[assetIx], { chartOpen: !this.state.list[assetIx].chartOpen })
        })
      })
    }
  }

  _setChartSelect (symbol) {
    const list = this.props.portfolio.list
    const asset = list.find(a => a.symbol === symbol)
    this.setState({ chartSelect: {
      name: asset.name,
      symbol: asset.symbol,
      infoUrl: asset.infoUrl,
      change: asset.change24,
      priceDecrease: asset.change24.isNegative(),
      price: asset.price
    } })
  }

  _assetRows () {
    return this.props.portfolio.list.map((a, i) => {
      if (a.shown) {
        return {
          name: a.name,
          symbol: a.symbol,
          units: a.balance,
          weight: a.percentage,
          price: a.price,
          value: a.fiat,
          change: a.change24,
          priceDecrease: a.change24.isNegative()
        }
      }
    }).filter(a => a)
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

  render () {
    const orderStatus = this._orderStatus()

    const portfolio = this.props.portfolio
    const layoutProps = {
      showAction: true,
      view: 'balances',
      disableAction: !portfolio || !portfolio.list || !portfolio.list.length || orderStatus === 'working',
      handleModify: () => this.props.routerPush('/modify')
    }
    const totalDecrease = portfolio.totalChange && portfolio.totalChange.isNegative()
    return (
      <Balances
        pieChart={<PieChartController chartSelect={this.state.chartSelect} handleChartSelect={this._setChartSelect} />}
        priceChart={<PriceChartController chartSelect={this.state.chartSelect} />}
        chartSelect={this.state.chartSelect}
        layoutProps={layoutProps}
        address={this.props.wallet.address}
        onRefreshBalances={this._getBalances}
        total={portfolio.total}
        total24hAgo={portfolio.total24hAgo}
        totalChange={portfolio.totalChange}
        totalDecrease={totalDecrease}
        assetRows={this.state.list}
        toggleChart={this._toggleChart}
        showOrderModal={this.props.orderModal.show}
        handleToggleOrderModal={this.props.toggleOrderModal}
        ready={!!portfolio.list.length}
        orderStatus={orderStatus}
      />
    )
  }
}

BalancesController.propTypes = {
  wallet: PropTypes.object.isRequired,
  assets: PropTypes.array.isRequired,
  portfolio: PropTypes.object.isRequired,
  mock: PropTypes.object.isRequired,
  getBalances: PropTypes.func.isRequired,
  routerPush: PropTypes.func.isRequired
}

const mapStateToProps = (state) => ({
  wallet: state.wallet,
  assets: state.assets,
  portfolio: state.portfolio,
  mock: state.mock,
  orderModal: state.orderModal,
  swap: state.swap
})

const mapDispatchToProps = (dispatch) => ({
  getBalances: (assets, portfolio, walletAddress, mock) => {
    return dispatch(getBalances(assets, portfolio, walletAddress, mock))
  },
  routerPush: (path) => {
    dispatch(push(path))
  },
  toggleOrderModal: () => {
    dispatch(toggleOrderModal())
  },
  resetSwap: () => {
    dispatch(resetSwap())
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(BalancesController)
