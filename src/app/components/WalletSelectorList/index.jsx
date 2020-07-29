import React from 'react'
import { compose, setDisplayName, setPropTypes, defaultProps, withHandlers, withState, withPropsOnChange } from 'recompose'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import debounceHandler from 'Hoc/debounceHandler'
import { Row, Col, Button } from 'reactstrap'
import PropTypes from 'prop-types'
import { sortObjOfArrayByTwoProperties } from 'Utilities/helpers'
import CoinIcon from 'Components/CoinIcon'
import { toastr } from 'react-redux-toastr'
import Fuse from 'fuse.js'
import classNames from 'class-names'
import style from 'Components/AssetSelectorList/style.scss'
import Expandable from 'Components/Expandable'

import { removeConnectedAccount, startConnect } from 'Actions/connectHardwareWallet'
import { getAllAssetsArray } from 'Common/selectors/asset'
import { getConnectedAccountIds } from 'Selectors/connectHardwareWallet'

const DEBOUNCE_WAIT = 400
const MAX_RESULTS = 50

const renderResult = (asset, { handleSelect, connectedAccountIds, handleRemove, index }) => {
  const { symbol, name } = asset
  let isConnected = Boolean(connectedAccountIds[symbol])
  return (
    <Row key={symbol} tabindex={0} className={classNames('p-0 m-0 position-relative cursor-pointer')} style={{ maxWidth: '100%' }}>
      <Col className='p-0 m-0'>
        <Button tag={Row} color='ultra-dark' size='sm' onClick={() => handleSelect(asset)}
          className={classNames(style.assetButtonList, 'flat text-left m-0')} style={{ borderTopWidth: index > 0 ? 0 : 1, height: 49 }}>
          <Col style={{ flex: '0 0 100%' }} className='pl-2 d-flex align-items-center' xs='8'>
            <CoinIcon symbol={symbol} style={{ width: 26, height: 26 }} className={classNames('mb-0', style.assetButtonIcon)} />
            <span className='ml-2'>{name} {symbol === 'ETH' && '& ERC20 tokens '}<small className='text-muted'>[{symbol}]</small></span>
            {isConnected && (
              <span style={{ top: 1 }} className='font-xs text-success ml-1 position-relative'>
                <Expandable shrunk={<span>(<i className='fa fa-check'></i>)</span>} expanded='Successfully connected!' />
              </span>
            )}
          </Col>
          <Col className={classNames('text-right p-0 align-items-center justify-content-end', !isConnected ? 'd-none' : 'd-flex')} xs='4'>
            <Expandable shrunk={(
              <Button
                color='transparent'
                tag='span'
                onClick={(e) => { e.stopPropagation(); return handleRemove(symbol)}}
                style={{ textDecoration: 'underline' }}
                className='cursor-pointer text-muted font-xs'
              > Disconnect wallet
              </Button>
            )} 
            expanded={'Remove wallet'} 
            />
          </Col>
        </Button>
      </Col>
    </Row>
  )}

const WalletSelectorList = ({  results, supportedAssetSymbols, ...props }) => {
  return (
    <Row style={{ maxWidth: '100%' }} className={classNames('p-0 m-0')}>
      {/* <Col className='p-0 m-0 position-relative' style={{ maxHeight: 41 }} sm='12'>
        <Input
          name='searchAsset'
          className='flat'
          placeholder='Search by name or symbol...'
          type='text'
          autoFocus
          autoComplete='off'
          onChange={handleSearchChange}
          onKeyPress={handleEnterButton}
        />
      </Col> */}
      <Col className='p-0 shadow' sm='12' style={{ maxHeight: (supportedAssetSymbols.length * 49), overflowY: 'scroll', zIndex: 99999, marginTop: 1 }}>
        {results.slice(0, 20).map((r, index) => renderResult(r, { index, ...props }))}
      </Col>
    </Row>
  )
}

export default compose(
  setDisplayName('WalletSelectorList'),
  setPropTypes({
    assets: PropTypes.array,
    supportedAssetSymbols: PropTypes.arrayOf(PropTypes.string),
    walletType: PropTypes.string
  }),
  defaultProps({
    supportedAssetSymbols: [],
    portfolioSymbols: [],
  }),
  connect(createStructuredSelector({
    assets: getAllAssetsArray,
    connectedAccountIds: getConnectedAccountIds,
  }), {
    removeAccount: removeConnectedAccount,
    startConnect,
  }),
  withState('searchQuery', 'updateSearchQuery', ''),
  withHandlers({
    applySortOrder: () => (list) => {
      return list.sort(sortObjOfArrayByTwoProperties(['disabled', '-marketCap']))
    },
  }),
  withState('extendedAssets', 'updateExtendedAssets', ({ assets, applySortOrder, supportedAssetSymbols }) => {
    return applySortOrder(assets.filter(a => supportedAssetSymbols.some(sym => a.symbol === sym)))
  }),
  withState('results', 'updateResults', ({ extendedAssets }) => extendedAssets),
  withPropsOnChange(['assets'], ({ extendedAssets }) => {
    const fuse = new Fuse(extendedAssets, {
      shouldSort: true,
      threshold: 0.6,
      location: 0,
      distance: 100,
      minMatchCharLength: 2,
      keys: [{
        name: 'symbol',
        weight: 0.8,
      }, {
        name: 'name',
        weight: 0.2,
      }],
    })
    return ({
      fuse
    })
  }),
  withHandlers({
    performSearch: ({ updateResults, fuse, applySortOrder, extendedAssets }) => (query) => {
      let results
      if (!query) {
        results = extendedAssets
      } else {
        results = fuse.search(query)
        results = applySortOrder(results)
        results = results.slice(0, MAX_RESULTS)
      }
      updateResults(results)
    },
    handleSelect: ({ startConnect, walletType }) => (asset) => {
      if (asset.disabled) {
        return toastr.warning('INVALID', `Cannot add ${asset.name}: ${asset.disabledMessage}`)
      }
      startConnect(walletType, asset.symbol)
    },
    handleRemove: ({ removeAccount }) => (symbol) => removeAccount(symbol)
  }),
  withHandlers({
    handleSearchChange: ({ performSearch, updateSearchQuery }) => (event) => {
      const query = event.target.value
      updateSearchQuery(query)
      performSearch(query)
    },
    handleEnterButton: ({ handleSelect, results }) => (event) => {
      if (event.key == 'Enter') {
        handleSelect(results[0])
      }
    },
  }),
  debounceHandler('performSearch', DEBOUNCE_WAIT),
)(WalletSelectorList)