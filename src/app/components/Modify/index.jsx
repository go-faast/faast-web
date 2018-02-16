import React, { Component } from 'react'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import BigNumber from 'bignumber.js'
import ModifyView from './view'
import { toUnit, toPercentage } from 'Utilities/convert'
import { updateObjectInArray } from 'Utilities/helpers'
import log from 'Utilities/log'
import toastr from 'Utilities/toastrWrapper'
import { setSwap, resetSwap, toggleOrderModal, showOrderModal } from 'Actions/redux'
import { initiateSwaps } from 'Actions/portfolio'
import { getCurrentPortfolioWithHoldings, getAllAssets } from 'Selectors'
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
      showAssetList: false
    }
    this._assetItem = this._assetItem.bind(this)
    this._handleSlider = this._handleSlider.bind(this)
    this._handleFiatChange = this._handleFiatChange.bind(this)
    this._handleWeightChange = this._handleWeightChange.bind(this)
    this._handleSave = this._handleSave.bind(this)
    this._handleAssetListShow = this._handleAssetListShow.bind(this)
    this._handleAssetListHide = this._handleAssetListHide.bind(this)
    this._handleSelectAsset = this._handleSelectAsset.bind(this)
    this._handleRemoveAsset = this._handleRemoveAsset.bind(this)
    this._handleCancel = this._handleCancel.bind(this)
  }

  componentWillMount () {
    const list = this.props.wallet.assetHoldings.filter(({ shown }) => shown).map(this._assetItem)
    this.setState({ list })
  }

  _assetItem (asset) {
    const weight = asset.percentage || ZERO
    const value = asset.fiat || ZERO
    const units = asset.balance || ZERO
    return {
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
      refInput: this[`refInput_${asset.symbol}`]
    }
  }

  _handleSlider (symbol, value, type = 'fiat') {
    const { wallet } = this.props
    const list = this.state.list
    const assetIx = list.findIndex(a => a.symbol === symbol)
    const asset = list[assetIx]
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
          weight = toPercentage(fiat, wallet.totalFiat)
          units = toUnit(fiat, asset.price, asset.decimals, true)
        }
        allowanceFiat = this.state.allowance.fiat.plus(available).round(2)
        allowanceWeight = toPercentage(allowanceFiat, wallet.totalFiat)
        break
      case 'weight':
        /* out of commission due to rounding issues. Determining fiat amount instead now */

        // weight = ZERO.plus(value)
        // fiat = weight.div(100).times(wallet.totalFiat)
        // units = asset.units.adjusted
        // allowanceWeight = this.state.allowance.weight.plus(available)
        // allowanceFiat = allowanceWeight.div(100).times(wallet.totalFiat)
        // allowanceFiat = this.state.allowance.fiat.plus(available)
        // allowanceWeight = percentage(allowanceFiat, wallet.totalFiat)
    }
    const updatedState = {
      list: updateObjectInArray(list, {
        index: assetIx,
        item: {
          ...asset,
          weight: { ...asset.weight, adjusted: weight },
          fiat: { ...asset.fiat, adjusted: fiat },
          units: { ...asset.units, adjusted: units }
        }
      }),
      allowance: {
        fiat: allowanceFiat,
        weight: allowanceWeight
      }
    }
    this.setState(updatedState)
    return updatedState
  }

  _handleFiatChange (change) {
    const symbol = Object.keys(change)[0]
    return this._handleSlider(symbol, change[symbol])
  }

  _handleWeightChange (change) {
    const symbol = Object.keys(change)[0]
    const weight = toBigNumber(change[symbol])
    const fiat = weight.div(100).times(this.props.wallet.totalFiat).round(2)
    return this._handleSlider(symbol, fiat)
  }

  _handleSave () {
    log.info('modify save')
    const { wallet } = this.props
    // const slider = this.state.slider
    if (this.state.allowance.fiat.greaterThan(0)) return toastr.error('Amounts remain to move')
    const filtered = this.state.list.map((a) => {
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
        const asset = wallet.assetHoldings.find((a) => a.symbol === s.symbol)
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
    this.props.initiateSwaps(repairedList, wallet)
    // this.props.routerPush('/swap')
    // this.props.changeSwapStatus('edit')
  }

  _handleAssetListShow () {
    this.setState({ showAssetList: true })
  }

  _handleAssetListHide () {
    this.setState({ showAssetList: false })
  }

  _handleSelectAsset (asset) {
    const symbol = asset.symbol || asset
    const { allAssets } = this.props
    let { list } = this.state
    let selectedHolding
    const existingHoldingIndex = list.findIndex((a) => a.symbol === symbol)
    if (existingHoldingIndex >= 0) {
      selectedHolding = {
        ...list[existingHoldingIndex],
        shown: true
      }
      list = [...list.slice(0, existingHoldingIndex), ...list.slice(existingHoldingIndex + 1)]
    } else {
      selectedHolding = this._assetItem(allAssets[symbol])
    }
    this.setState({
      list: [selectedHolding].concat(list)
    })
    this._handleAssetListHide()
  }

  _handleRemoveAsset (symbol) {
    let list = this.state.list
    const selectedAssetIx = list.findIndex((a) => a.symbol === symbol)
    const selectedAsset = list[selectedAssetIx]
    const updatedState = this._handleFiatChange({ [selectedAsset.symbol]: '0' })
    list = updatedState.list
    this.setState({
      list: [...list.slice(0, selectedAssetIx), { ...list[selectedAssetIx], shown: false }, ...list.slice(selectedAssetIx + 1)]
    })
  }

  _handleCancel () {
    this.props.resetSwap()
    this.props.history.goBack()
  }

  render () {
    const { wallet } = this.props
    const { list } = this.state
    const shownList = list.filter(({ shown }) => shown)
    const sliderProps = {
      max: wallet.totalFiat.toNumber(),
      // allowance: this.state.allowance.fiat,
      onValueChange: this._handleSlider
    }
    const layoutProps = {
      showAction: true,
      view: 'modify',
      handleCancel: this._handleCancel,
      handleSave: this._handleSave,
      stickyHeader: true
    }
    const assetListProps = {
      supportedAssetSymbols: wallet.supportedAssets,
      hiddenAssetSymbols: shownList.map(({ symbol }) => symbol),
      handleClose: this._handleAssetListHide,
      selectAsset: this._handleSelectAsset,
      ignoreUnavailable: false
    }
    return (
      <ModifyView
        layoutProps={layoutProps}
        mq={this.props.mq}
        assetListProps={assetListProps}
        showAssetList={this.state.showAssetList}
        handleAssetListShow={this._handleAssetListShow}
        handleRemove={this._handleRemoveAsset}
        list={shownList}
        sliderProps={sliderProps}
        allowance={this.state.allowance}
        handleFiatChange={this._handleFiatChange}
        handleWeightChange={this._handleWeightChange}
        showSignTxModal={this.props.orderModal.show}
        handleToggleSignTxModal={this.props.toggleOrderModal}
        handleCancel={() => this.props.changeView('balances')}
      />
    )
  }
}

const mapStateToProps = (state) => ({
  wallet: getCurrentPortfolioWithHoldings(state),
  allAssets: getAllAssets(state),
  orderModal: state.orderModal,
  mq: state.mediaQueries
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
