import React, { Fragment } from 'react'
import routes from 'Routes'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import { push as pushAction } from 'react-router-redux'
import { compose, setDisplayName, setPropTypes, defaultProps, withState, withHandlers, lifecycle } from 'recompose'
import { Table, Media, Dropdown, DropdownToggle, DropdownMenu, 
  DropdownItem, Card, CardHeader, CardBody, Col, Row } from 'reactstrap'
import PropTypes from 'prop-types'
import classNames from 'class-names'
import withToggle from 'Hoc/withToggle'

import Units from 'Components/Units'
import ChangePercent from 'Components/ChangePercent'
import PriceArrowIcon from 'Components/PriceArrowIcon'
import CoinIcon from 'Components/CoinIcon'
import Expandable from 'Components/Expandable'
import WatchlistStar from 'Components/WatchlistStar'
import AssetSearchBox from 'Components/AssetSearchBox'
import Loading from 'Components/Loading'
import Icon from 'Components/Icon'

import PriceArrowIconSvg from 'Img/price-arrow.svg?inline'
import { sortObjOfArray } from 'Utilities/helpers'
import { areAssetPricesLoaded, getAssetPricesError } from 'Selectors'

import { indexTable, mediaBody, sortingArrow } from './style'

const TableRow = ({ asset: { symbol, availableSupply, name,
  marketCap, price, change24, volume24, change7d, change1 }, timeFrame, push, defaultPriceChange, ...props }) => {
  timeFrame = defaultPriceChange ? defaultPriceChange : timeFrame
  const percentChange = timeFrame === '1d' ? change24 : timeFrame === '7d' ? change7d : change1
  return (
    <tr {...props}>
      <td className='pl-3 pl-md-4'>
        <WatchlistStar
          symbol={symbol}
        />
      </td>
      <td onClick={() => push(routes.assetDetail(symbol))}>
        <Media>
          <Media left>
            <CoinIcon 
              className='mr-2 mt-2' 
              symbol={symbol} 
              style={{ width: '25px', height: '25px' }} 
              inline
            /> 
          </Media>
          <Media className={mediaBody} body>
            <Expandable shrunk={<h6 className='textEllipsis m-0 mt-1 text-white'>{name}</h6>} expanded={name}></Expandable>
            <small style={{ position: 'relative', top: '-2px' }} className='text-muted'>[{symbol}]</small>
          </Media>
        </Media>
      </td>
      <td onClick={() => push(routes.assetDetail(symbol))}>
        <Units 
          className='mt-1 d-inline-block'
          value={price} 
          symbol={'$'} 
          precision={6} 
          prefixSymbol
          symbolSpaced={false}
        />
      </td>
      <td onClick={() => push(routes.assetDetail(symbol))}>
        <Units
          className='text-nowrap'
          value={marketCap} 
          symbol={'$'} 
          precision={6}
          symbolSpaced={false}
          prefixSymbol
          abbreviate
        />
      </td>
      <td onClick={() => push(routes.assetDetail(symbol))}>
        <Units
          className='text-nowrap'
          value={volume24} 
          symbol={'$'} 
          precision={6} 
          symbolSpaced={false}
          prefixSymbol
          abbreviate
        />
      </td>
      <td onClick={() => push(routes.assetDetail(symbol))}>
        <Units
          className='text-nowrap'
          value={availableSupply} 
          symbol={symbol} 
          precision={6} 
          abbreviate
        />
      </td>
      <td onClick={() => push(routes.assetDetail(symbol))}>
        <div>
          <ChangePercent>{percentChange}</ChangePercent>
          <PriceArrowIcon
            style={{ position: 'relative', top: '0px' }}
            className={classNames('swapChangeArrow', percentChange.isZero() ? 'd-none' : null)} 
            size={.58} dir={percentChange < 0 ? 'down' : 'up'} 
            color={percentChange < 0 ? 'danger' : percentChange > 0 ? 'success' : null}
          />
        </div>
      </td>
    </tr>
  )
}

const AssetIndexTable = ({ assetList, push, toggleDropdownOpen, isDropdownOpen, updateTimeFrame, 
  timeFrame, tableHeader, defaultPriceChange, heading, pricesLoaded, pricesError, showSearch, handleSortKey,
  sortKey, sortDesc
}) => (
  <Fragment>
    <Row className='justify-content-between align-items-end gutter-x-3'>
      {showSearch && (<Col xs='12' sm={{ size: true, order: 2 }}>
        <AssetSearchBox className='float-sm-right'/>
      </Col>)}
      <Col xs='12' sm={{ size: 'auto', order: 1 }}>
        {heading && (heading)}
      </Col>
    </Row>
    {pricesLoaded ? (
      <Card className='mb-4'>
        <CardHeader>
          <h5>{tableHeader}</h5>
        </CardHeader>
        <CardBody className='p-0'>
          {assetList.length === 0 ? (
            <p className='text-center mt-3'>
              <i>No assets to show. Please refresh.</i>
            </p>
          ) : (
            <Table hover striped responsive className={indexTable}>
              <thead>
                <tr>
                  <th className='border-0'></th>
                  <th onClick={() => handleSortKey('name')} className='pl-3 pl-md-5 border-0'>
                    Coin {sortKey === 'name' && (<Icon src={PriceArrowIconSvg} className={sortingArrow} rotate={sortDesc ? 'down' : 'up'} />)}
                  </th>
                  <th onClick={() => handleSortKey('price')} className='border-0'>
                    Price {sortKey === 'price' && (<Icon src={PriceArrowIconSvg} className={sortingArrow} rotate={sortDesc ? 'down' : 'up'} />)}
                  </th>
                  <th onClick={() => handleSortKey('marketCap')} className='border-0'>
                    Market Cap {sortKey === 'marketCap' && (<Icon src={PriceArrowIconSvg} className={sortingArrow} rotate={sortDesc ? 'down' : 'up'} />)}
                  </th>
                  <th onClick={() => handleSortKey('volume24')} className='border-0'>
                    Volume {sortKey === 'volume24' && (<Icon src={PriceArrowIconSvg} className={sortingArrow} rotate={sortDesc ? 'down' : 'up'} />)}
                  </th>
                  <th onClick={() => handleSortKey('availableSupply')} className='border-0'>
                    Supply {sortKey === 'availableSupply' && (<Icon src={PriceArrowIconSvg} className={sortingArrow} rotate={sortDesc ? 'down' : 'up'} />)}
                  </th>
                  <th className={classNames('border-0', !defaultPriceChange ? 'p-0' : null)}>
                    {!defaultPriceChange ? (
                      <Dropdown group isOpen={isDropdownOpen} size="sm" toggle={toggleDropdownOpen}>
                        <DropdownToggle 
                          className='py-0 px-2 flat position-relative d-inline' 
                          style={{ top: '-4px' }}
                          color='dark' 
                          caret
                        >
                          {timeFrame} Change
                        </DropdownToggle>
                        <DropdownMenu className='p-0' right>
                          <DropdownItem
                            active={timeFrame === '7d'} 
                            onClick={() => updateTimeFrame('7d')}
                            className='py-2'
                          >
                      7d
                          </DropdownItem>
                          <DropdownItem className='m-0' divider/>
                          <DropdownItem 
                            active={timeFrame === '1d'} 
                            onClick={() => updateTimeFrame('1d')}
                            className='py-2'
                          >
                      1d
                          </DropdownItem>
                          <DropdownItem className='m-0' divider/>
                          <DropdownItem 
                            active={timeFrame === '1h'} 
                            onClick={() => updateTimeFrame('1h')}
                            className='py-2'
                          >
                      1h
                          </DropdownItem>
                        </DropdownMenu>
                      </Dropdown>) : `${defaultPriceChange} Change`}
                  </th>
                </tr>
              </thead>
              <tbody>
                {assetList.map((asset) => (
                  <TableRow 
                    key={asset.symbol} 
                    asset={asset} 
                    push={push}
                    timeFrame={timeFrame}
                    defaultPriceChange={defaultPriceChange}
                  />
                )
                )}
              </tbody>
            </Table>
          )}
        </CardBody>
      </Card>) : (
      <Loading center label='Loading market data...' error={pricesError}/>
    )}
  </Fragment>
)

export default compose(
  setDisplayName('AssetIndexTable'),
  connect(createStructuredSelector({
    pricesLoaded: areAssetPricesLoaded,
    pricesError: getAssetPricesError, 
  }),{
    push: pushAction
  }),
  setPropTypes({
    assets: PropTypes.arrayOf(PropTypes.object).isRequired,
    tableHeader: PropTypes.node,
    defaultPriceChange: PropTypes.string,
    heading: PropTypes.node,
    showSearch: PropTypes.bool,
    allowSorting: PropTypes.bool
  }),
  defaultProps({
    assets: [],
    tableHeader: 'Assets',
    defaultPriceChange: undefined,
    heading: undefined,
    showSearch: true,
    allowSorting: true
  }),
  withState('assetList', 'updateAssetList', ({ assets }) => assets),
  withState('sortKey', 'updateSortKey', ({ allowSorting }) => allowSorting ? 'marketCap' : null),
  withState('sortDesc', 'updateSortOrder', true),
  withHandlers({
    handleSort: ({ assetList, allowSorting, updateAssetList, updateSortOrder, sortDesc, sortKey: currentSortKey }) => (sortKey) => {
      let order
      if (currentSortKey == sortKey) {
        sortDesc = !sortDesc
      } else {
        sortDesc = true
      }
      order = sortDesc ? 'desc' : 'asc'
      updateSortOrder(sortDesc)
      return allowSorting ? updateAssetList(sortObjOfArray(assetList, sortKey, order)) : assetList
    }
  }),
  withHandlers({
    handleSortKey: ({ updateSortKey, handleSort, allowSorting }) => (sortKey) => {
      allowSorting && (updateSortKey(sortKey))
      return handleSort(sortKey)
    }
  }),
  withState('timeFrame', 'updateTimeFrame', ({ defaultPriceChange }) => {
    if (defaultPriceChange) {
      return defaultPriceChange
    } else {
      return '1d'
    }
  }),
  lifecycle({
    componentWillUpdate(nextProps) {
      const { updateAssetList, assets, assetList, allowSorting } = nextProps
      if ((assets != assetList) && !allowSorting) {
        updateAssetList(assets)
      }
    }
  }),
  withToggle('dropdownOpen'),
)(AssetIndexTable)
