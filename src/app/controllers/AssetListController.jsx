import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { toastr } from 'react-redux-toastr'
import Fuse from 'fuse.js'
import AssetList from 'Views/AssetList'
import { sortByProperty } from 'Utilities/helpers'

class AssetListController extends Component {
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
    const { assets } = this.props
    const sorted = [...assets].sort((a, b) => b.marketCap.cmp(a.marketCap))
    const list = sortByProperty(sorted, 'portfolio')
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
    const { isAvailableTest, ignoreUnavailable, selectAsset } = this.props
    if (!ignoreUnavailable && !isAvailableTest(asset)) {
      return toastr.warning('COMING SOON', `${asset.name} is not available yet`)
    }
    selectAsset(asset)
  }

  render () {
    const { columns, ignoreUnavailable, isAvailableTest, showBalance, handleClose } = this.props
    const { list, value } = this.state
    const { _handleSelect, _handleChange, _handleSubmit } = this
    return (
      <AssetList
        columns={columns}
        list={list}
        handleSelect={_handleSelect}
        ignoreUnavailable={ignoreUnavailable}
        isAvailableTest={isAvailableTest}
        showBalance={showBalance}
        searchValue={value}
        handleSearchChange={_handleChange}
        handleClose={handleClose}
        onSubmit={_handleSubmit}
      />
    )
  }
}

AssetListController.propTypes = {
  columns: PropTypes.number,
  assets: PropTypes.array,
  ignoreUnavailable: PropTypes.bool,
  isAvailableTest: PropTypes.func,
  showBalance: PropTypes.bool,
  handleClose: PropTypes.func
}

AssetListController.defaultProps = {
  ignoreUnavailable: false,
  isAvailableTest: (asset) => asset.portfolio
}

export default AssetListController
