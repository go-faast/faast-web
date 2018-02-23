import React, { Component } from 'react'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import BigNumber from 'bignumber.js'
import ModifyView from './view'
import { toUnit, toPercentage } from 'Utilities/convert'
import { updateObjectInArray, splice } from 'Utilities/helpers'
import log from 'Utilities/log'
import toastr from 'Utilities/toastrWrapper'
import { setSwap, resetSwap, toggleOrderModal, showOrderModal } from 'Actions/redux'
import { initiateSwaps } from 'Actions/portfolio'
import { getCurrentPortfolioWithWalletHoldings, getAllAssets } from 'Selectors'
import { toBigNumber } from 'Utilities/convert'

const ZERO = new BigNumber(0)

class Modify extends Component {
  constructor () {
    super()
    this.state = {
      allowance: {
        fiat: ZERO,
        weight: ZERO
      },
      isAssetListOpen: false,
      assetListWalletId: '',
      holdings: {},
    }
    this._assetItem = this._assetItem.bind(this)
    this._handleSlider = this._handleSlider.bind(this)
    this._handleFiatChange = this._handleFiatChange.bind(this)
    this._handleWeightChange = this._handleWeightChange.bind(this)
    this._showAssetList = this._showAssetList.bind(this)
    this._hideAssetList = this._hideAssetList.bind(this)
    this._toggleAssetList = this._toggleAssetList.bind(this)
    this._handleSelectAsset = this._handleSelectAsset.bind(this)
    this._handleRemoveAsset = this._handleRemoveAsset.bind(this)
    this._handleSave = this._handleSave.bind(this)
    this._handleCancel = this._handleCancel.bind(this)
  }

  componentWillMount () {
    const holdings = this.props.portfolio.nestedWallets
      .reduce((byWalletId, { id, assetHoldings }) => ({
        ...byWalletId,
        [id]: assetHoldings
          .filter(({ shown }) => shown)
          .map((asset) => this._assetItem(id, asset))
      }), {})
    this.setState({ holdings })
  }

  _assetItem (walletId, asset) {
    console.log('assetItem', walletId, asset)
    const weight = asset.percentage || ZERO
    const value = asset.fiat || ZERO
    const units = asset.balance || ZERO
    return {
      walletId,
      symbol: asset.symbol,
      name: asset.name,
      decimals: asset.decimals,
      price: asset.price,
      change24: asset.change24,
      priceDecrease: asset.change24.isNegative(),
      shown: true,
      weight: {
        original: weight,
        adjusted: weight
      },
      fiat: {
        original: value,
        adjusted: value
      },
      units: {
        original: units,
        adjusted: units
      },
      refInput: this[`refInput_${walletId}_${asset.symbol}`]
    }
  }

  _handleSlider (walletId, symbol, value, type = 'fiat') {
    console.log('handleSlider', walletId, symbol, value, type)
    const { portfolio } = this.props
    const { holdings } = this.state
    const walletHoldings = holdings[walletId]
    const assetIx = walletHoldings.findIndex(a => a.symbol === symbol)
    const asset = walletHoldings[assetIx]
    value = toBigNumber(value)

    if (value.lt(0)) {
      value = ZERO
    }
    const maxAllowed = asset[type].adjusted.plus(this.state.allowance[type])
    if (maxAllowed.lessThanOrEqualTo(value)) {
      value = maxAllowed
    }

    const available = asset[type].adjusted.minus(value)
    let fiat
    let weight
    let units
    let allowanceFiat
    let allowanceWeight
    switch (type) {
      case 'fiat':
        fiat = ZERO.plus(value)
        if (asset.fiat.original.round(2).equals(value)) {
          fiat = asset.fiat.original
          weight = asset.weight.original
          units = asset.units.original
        } else {
          weight = toPercentage(fiat, portfolio.totalFiat)
          units = toUnit(fiat, asset.price, asset.decimals, true)
        }
        allowanceFiat = this.state.allowance.fiat.plus(available).round(2)
        allowanceWeight = toPercentage(allowanceFiat, portfolio.totalFiat)
        break
      case 'weight':
        /* out of commission due to rounding issues. Determining fiat amount instead now */

        // weight = ZERO.plus(value)
        // fiat = weight.div(100).times(portfolio.totalFiat)
        // units = asset.units.adjusted
        // allowanceWeight = this.state.allowance.weight.plus(available)
        // allowanceFiat = allowanceWeight.div(100).times(portfolio.totalFiat)
        // allowanceFiat = this.state.allowance.fiat.plus(available)
        // allowanceWeight = percentage(allowanceFiat, portfolio.totalFiat)
    }
    const updatedState = {
      holdings: {
        ...holdings,
        [walletId]: updateObjectInArray(walletHoldings, {
          index: assetIx,
          item: {
            ...asset,
            weight: { ...asset.weight, adjusted: weight },
            fiat: { ...asset.fiat, adjusted: fiat },
            units: { ...asset.units, adjusted: units }
          }
        }),
      },
      allowance: {
        fiat: allowanceFiat,
        weight: allowanceWeight
      }
    }
    this.setState(updatedState)
    return updatedState
  }

  _handleFiatChange (walletId, symbol, value) {
    return this._handleSlider(walletId, symbol, value)
  }

  _handleWeightChange (walletId, symbol, value) {
    const weight = toBigNumber(value)
    const fiat = weight.div(100).times(this.props.portfolio.totalFiat).round(2)
    return this._handleSlider(walletId, symbol, fiat)
  }

  _handleSave () {
    log.info('modify save')
    const { portfolio } = this.props
    const { allowance, holdings } = this.state
    // const slider = this.state.slider
    if (allowance.fiat.greaterThan(0)) return toastr.error('Amounts remain to move')
    const filtered = Object.values(holdings).reduce((flat, h) => flat.concat(h)).map((a) => {
      if (!a.fiat.adjusted.equals(a.fiat.original)) {
        const fiatToSwap = a.fiat.original.minus(a.fiat.adjusted)
        return Object.assign({}, a, { fiatToSwap })
      }
    }).filter(a => !!a)
    if (!filtered.length) return toastr.error('Nothing to swap')
    const swapSend = filtered.filter(s => !s.fiatToSwap.isNegative()).map((s) => {
      return Object.assign({}, s, { emptyAsset: s.fiat.adjusted.isZero() })
    })
    const swapReceive = filtered.filter((s) => s.fiatToSwap.isNegative())
    const sendReduce = swapSend.reduce((sAcc, sVal) => {
      const receiveReduce = sAcc.receiveList.reduce((rAcc, rVal) => {
        let remaining
        let toSend
        let spent = new BigNumber(0)
        if (rAcc.toSwap.greaterThan(0) && rVal.fiatToSwap.lessThan(0)) {
          remaining = rAcc.toSwap.plus(rVal.fiatToSwap)
          spent = remaining.lessThan(0) ? rAcc.toSwap : rAcc.toSwap.minus(remaining)
          const unit = toUnit(spent, sVal.price, sVal.decimals, true)
          toSend = rAcc.toSend.concat({ symbol: rVal.symbol, unit })
        } else {
          remaining = rAcc.toSwap
          toSend = rAcc.toSend
        }
        return Object.assign({}, rAcc, {
          toSwap: remaining,
          toSend,
          list: rAcc.list.concat(Object.assign({}, rVal, {
            fiatToSwap: rVal.fiatToSwap.plus(spent)
          }))
        })
      }, { toSwap: sVal.fiatToSwap, toSend: [], list: [] })
      return Object.assign({}, sAcc, {
        swapList: sAcc.swapList.concat({
          walletId: sVal.walletId,
          symbol: sVal.symbol,
          list: receiveReduce.toSend,
          emptyAsset: sVal.emptyAsset
        }),
        receiveList: receiveReduce.list
      })
    }, { receiveList: swapReceive, swapList: [] })
    const repairedList = sendReduce.swapList.map((s) => {
      if (s.emptyAsset) {
        const sum = s.list.reduce((a, c) => {
          return a.plus(c.unit)
        }, new BigNumber(0))
        const asset = portfolio.assetHoldings.find((a) => a.symbol === s.symbol)
        const difference = asset.balance.minus(sum)
        const last = s.list[s.list.length - 1]
        const newAmount = last.unit.plus(difference)
        const newLast = Object.assign({}, last, {
          unit: newAmount
        })
        const newList = s.list.slice(0, -1).concat([newLast])
        return Object.assign({}, s, { list: newList })
      }
      return s
    })

    const emptyingETH = repairedList.find(a => a.symbol === 'ETH' && a.emptyAsset)
    if (emptyingETH) return toastr.error('Swapping the entire balance of your Ether is not possible as some ETH is required for transaction fees', { timeOut: 10000 })
    this.props.setSwap(repairedList)
    this.props.showOrderModal()
    this.props.initiateSwaps(repairedList, portfolio)
    // this.props.routerPush('/swap')
    // this.props.changeSwapStatus('edit')
  }

  _hideAssetList () {
    this.setState({ isAssetListOpen: false })
  }

  _showAssetList (walletId) {
    this.setState({ isAssetListOpen: true, assetListWalletId: walletId })
  }

  _toggleAssetList () {
    this.setState({ isAssetListOpen: !this.state.isAssetListOpen })
  }

  _handleSelectAsset ({ symbol }) {
    const { allAssets } = this.props
    let { holdings, assetListWalletId: walletId } = this.state
    let walletHoldings = holdings[walletId]
    let selectedHolding
    let existingHoldingIndex = walletHoldings.findIndex((a) => a.symbol === symbol)
    if (existingHoldingIndex >= 0) {
      selectedHolding = {
        ...walletHoldings[existingHoldingIndex],
        shown: true
      }
      walletHoldings = splice(walletHoldings, existingHoldingIndex, 1)
    } else {
      selectedHolding = this._assetItem(walletId, allAssets[symbol])
    }
    this.setState({
      holdings: {
        ...holdings,
        [walletId]: walletHoldings.concat([selectedHolding])
      }
    })
    this._hideAssetList()
  }

  _handleRemoveAsset (walletId, symbol) {
    const updatedState = this._handleFiatChange(walletId, symbol, 0)
    const { holdings } = updatedState
    const walletHoldings = holdings[walletId]
    const selectedAssetIx = walletHoldings.findIndex((a) => a.symbol === symbol)
    this.setState({
      holdings: {
        ...holdings,
        [walletId]: splice(walletHoldings, selectedAssetIx, 1, { ...walletHoldings[selectedAssetIx], shown: false })
      }
    })
  }

  _handleCancel () {
    this.props.resetSwap()
    this.props.routerPush('/balances')
  }

  render () {
    const { portfolio } = this.props
    const { holdings, assetListWalletId } = this.state
    const adjustedPortfolio = {
      ...portfolio,
      nestedWallets: portfolio.nestedWallets.map((nestedWallet) => ({ ...nestedWallet, assetHoldings: holdings[nestedWallet.id] }))
    }
    const sliderProps = {
      max: portfolio.totalFiat.toNumber(),
      // allowance: this.state.allowance.fiat,
      onValueChange: this._handleSlider
    }
    const layoutProps = {
      showAction: false,
      view: 'modify',
      stickyHeader: true
    }
    const assetListProps = {
      supportedAssetSymbols: ((portfolio.nestedWallets.find(({ id }) => id === assetListWalletId) || {}).supportedAssets || []),
      hiddenAssetSymbols: (holdings[assetListWalletId] || []).filter(({ shown }) => shown).map(({ symbol }) => symbol),
      handleClose: this._hideAssetList,
      selectAsset: this._handleSelectAsset,
      ignoreUnavailable: false
    }
    return (
      <ModifyView
        layoutProps={layoutProps}
        assetListProps={assetListProps}
        isAssetListOpen={this.state.isAssetListOpen}
        showAssetList={this._showAssetList}
        hideAssetList={this._hideAssetList}
        toggleAssetList={this._toggleAssetList}
        handleRemove={this._handleRemoveAsset}
        portfolio={adjustedPortfolio}
        sliderProps={sliderProps}
        allowance={this.state.allowance}
        handleFiatChange={this._handleFiatChange}
        handleWeightChange={this._handleWeightChange}
        showSignTxModal={this.props.orderModal.show}
        handleToggleSignTxModal={this.props.toggleOrderModal}
        handleCancel={this._handleCancel}
        handleSave={this._handleSave}
      />
    )
  }
}

const mapStateToProps = (state) => ({
  portfolio: getCurrentPortfolioWithWalletHoldings(state),
  allAssets: getAllAssets(state),
  orderModal: state.orderModal
})

const mapDispatchToProps = {
  setSwap,
  resetSwap,
  routerPush: push,
  initiateSwaps,
  toggleOrderModal,
  showOrderModal,
}

export default connect(mapStateToProps, mapDispatchToProps)(Modify)
