import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import { toastr } from 'react-redux-toastr'
import Fuse from 'fuse.js'
import AssetSelectorView from './view'
import { sortByProperty } from 'Utilities/helpers'
import { getAllAssetsArray } from 'Selectors'

function getInitState (props) {
  const { assets, supportedAssetSymbols, hiddenAssetSymbols } = props
  let assetList = [...assets]
    .filter((a) => !hiddenAssetSymbols.includes(a.symbol))
    .map((a) => ({
      ...a,
      hasWalletSupport: supportedAssetSymbols.includes(a.symbol)
    }))
    .sort((a, b) => b.marketCap.cmp(a.marketCap))
  assetList = sortByProperty(assetList, 'swapEnabled', 'hasWalletSupport')
  const fuse = new Fuse(assetList, {
    shouldSort: true,
    threshold: 0.6,
    location: 0,
    distance: 100,
    keys: ['symbol', 'name']
  })
  return {
    searchQuery: '',
    fuse,
    assetList,
    assetListOriginal: assetList
  }
}

class AssetSelector extends Component {
  constructor (props) {
    super(props)
    this.handleSelect = this.handleSelect.bind(this)
    this.handleSearchChange = this.handleSearchChange.bind(this)
    this.handleSearchSubmit = this.handleSearchSubmit.bind(this)
    this.state = getInitState(props)
  }

  handleSearchChange (event) {
    const query = event.target.value
    let results
    if (!query) {
      results = this.state.assetListOriginal
    } else {
      results = this.state.fuse.search(query)
    }
    this.setState({
      searchQuery: query,
      assetList: results
    })
  }

  handleSearchSubmit () {
    const { assetList, searchQuery } = this.state
    if (searchQuery && assetList.length > 0) {
      this.handleSelect(assetList[0])
    }
  }

  handleSelect (asset) {
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
    const { assetList } = this.state
    const { handleSelect, handleSearchSubmit, handleSearchChange } = this
    return (
      <AssetSelectorView
        assetList={assetList}
        handleSelect={handleSelect}
        handleSearchSubmit={handleSearchSubmit}
        handleSearchChange={handleSearchChange}
      />
    )
  }
}

AssetSelector.propTypes = {
  assets: PropTypes.array.isRequired,
  selectAsset: PropTypes.func.isRequired,
  supportedAssetSymbols: PropTypes.arrayOf(PropTypes.string),
  hiddenAssetSymbols: PropTypes.arrayOf(PropTypes.string),
}

AssetSelector.defaultProps = {
  supportedAssetSymbols: [],
  hiddenAssetSymbols: [],
}

export default connect(createStructuredSelector({
  assets: getAllAssetsArray,
}))(AssetSelector)
