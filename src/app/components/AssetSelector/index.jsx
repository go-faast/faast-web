import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import { toastr } from 'react-redux-toastr'
import Fuse from 'fuse.js'
import AssetListView from './view'
import { sortByProperty } from 'Utilities/helpers'
import { getAllAssetsArray } from 'Selectors'

class AssetSelector extends Component {
  constructor () {
    super()
    this.state = {
      value: '',
      list: [],
      originalList: []
    }
    this._setList = this._setList.bind(this)
    this._handleChange = this._handleChange.bind(this)
    this._handleSubmit = this._handleSubmit.bind(this)
    this._handleSelect = this._handleSelect.bind(this)
  }

  componentWillMount () {
    this._setList()
  }

  _setList () {
    const { assets, supportedAssetSymbols, hiddenAssetSymbols } = this.props
    let list = [...assets]
      .filter((a) => !hiddenAssetSymbols.includes(a.symbol))
      .map((a) => ({
        ...a,
        hasWalletSupport: supportedAssetSymbols.includes(a.symbol)
      }))
      .sort((a, b) => b.marketCap.cmp(a.marketCap))
    list = sortByProperty(list, 'swapEnabled', 'hasWalletSupport')
    this.fuse = new Fuse(list, {
      shouldSort: true,
      threshold: 0.6,
      location: 0,
      distance: 100,
      keys: ['name']
    })
    this.setState({
      value: '',
      list,
      originalList: list
    })
  }

  _handleChange (event) {
    const newValue = event.target.value
    let newList
    if (!newValue) {
      newList = this.state.originalList
    } else {
      newList = this.fuse.search(newValue)
    }
    this.setState({
      value: newValue,
      list: newList
    })
  }

  _handleSubmit () {
    const list = this.state.list
    if (this.state.value && list.length) {
      this._handleSelect(list[0])
    }
  }

  _handleSelect (asset) {
    const { selectAsset } = this.props
    if (!asset.swapEnabled) {
      return toastr.warning('COMING SOON', `${asset.name} is not available yet`)
    }
    if (!asset.hasWalletSupport) {
      return toastr.warning('UNSUPPORTED WALLET', `Please connect a wallet that supports ${asset.name}`)
    }
    selectAsset(asset)
  }

  render () {
    const { columns, supportedAssetSymbols, showBalance, handleClose } = this.props
    const { list, value } = this.state
    const { _handleSelect, _handleChange, _handleSubmit } = this
    return (
      <AssetListView
        columns={columns}
        list={list}
        handleSelect={_handleSelect}
        showBalance={showBalance}
        searchValue={value}
        handleSearchChange={_handleChange}
        handleClose={handleClose}
        onSubmit={_handleSubmit}
        supportedAssetSymbols={supportedAssetSymbols}
      />
    )
  }
}

AssetSelector.propTypes = {
  assets: PropTypes.array.isRequired,
  supportedAssetSymbols: PropTypes.arrayOf(PropTypes.string),
  hiddenAssetSymbols: PropTypes.arrayOf(PropTypes.string),
  columns: PropTypes.number,
  showBalance: PropTypes.bool,
  handleClose: PropTypes.func
}

AssetSelector.defaultProps = {
  supportedAssetSymbols: [],
  hiddenAssetSymbols: [],
  columns: 4,
}

export default connect(createStructuredSelector({
  assets: getAllAssetsArray,
}))(AssetSelector)
