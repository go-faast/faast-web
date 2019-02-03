import React, { Fragment } from 'react'
import routes from 'Routes'
import { connect } from 'react-redux'
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
import Icon from 'Components/Icon'

import PriceArrowIconSvg from 'Img/price-arrow.svg?inline'
import { sortObjOfArray } from 'Utilities/helpers'

import { indexTable, mediaBody, sortingArrow } from './style'

const TableRow = ({ asset: { symbol, availableSupply, name,
  marketCap, price, change24, volume24, change7d, change1 }, timeFrame, push, defaultPriceChange, ...props }) => {
  timeFrame = defaultPriceChange ? defaultPriceChange : timeFrame
  const percentChange = timeFrame === '1d' ? change24 : timeFrame === '7d' ? change7d : change1
  return (
    <tr {...props}>
      <td className='pl-3 pl-md-4 d-none d-md-table-cell'>
        <WatchlistStar
          symbol={symbol}
        />
      </td>
      <td onClick={() => push(routes.assetDetail(symbol))}>
        <Media>
          <Media left>
            <span style={{ verticalAlign: 'sub' }} className='d-inline d-md-none mr-2'>
              <WatchlistStar
                symbol={symbol}
              />
            </span>
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
        <Row className='d-flex d-md-none'>
          <Col className='position-relative' xs='8'>
            <div className='pl-3 ml-2 font-xs text-muted'>
              <div className='mt-1'>
                <span style={{ width: 45 }} className='mr-2 d-inline-block'>Mkt Cap:</span>
                <span>
                  <Units
                    className='text-nowrap'
                    value={marketCap} 
                    symbol={'$'} 
                    precision={6}
                    symbolSpaced={false}
                    prefixSymbol
                    abbreviate
                  />
                </span>
              </div>
              <div className='mt-1'>
                <span style={{ width: 45 }} className='mr-2 d-inline-block'>24h Vol:</span>
                <span>
                  <Units
                    className='text-nowrap'
                    value={volume24} 
                    symbol={'$'} 
                    precision={6} 
                    symbolSpaced={false}
                    prefixSymbol
                    abbreviate
                  />
                </span>
              </div>
              <div className='mt-1'>
                <span style={{ width: 45 }} className='mr-2 d-inline-block'>Supply:</span>
                <span>
                  <Units
                    className='text-nowrap'
                    value={availableSupply} 
                    symbol={symbol} 
                    precision={6} 
                    abbreviate
                  />
                </span>
              </div>
            </div>
          </Col>
        </Row>
      </td>
      <td className='d-table-cell d-md-none'>
        <span className='position-relative'>
          <Units 
            className='my-1 d-inline-block'
            value={price} 
            symbol={'$'} 
            precision={6} 
            prefixSymbol
            symbolSpaced={false}
          />
        </span>
      </td>
      <td className='d-table-cell d-md-none'>
        <span>
          <ChangePercent>{percentChange}</ChangePercent>
          <PriceArrowIcon
            style={{ position: 'relative', top: '0px' }}
            className={classNames('swapChangeArrow', percentChange.isZero() ? 'd-none' : null)} 
            size={.58} dir={percentChange < 0 ? 'down' : 'up'} 
            color={percentChange < 0 ? 'danger' : percentChange > 0 ? 'success' : null}
          />
        </span>
      </td>
      <td className='d-none d-md-table-cell' onClick={() => push(routes.assetDetail(symbol))}>
        <Units 
          className='mt-1 d-inline-block'
          value={price} 
          symbol={'$'} 
          precision={6} 
          prefixSymbol
          symbolSpaced={false}
        />
      </td>
      <td className='d-none d-md-table-cell' onClick={() => push(routes.assetDetail(symbol))}>
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
      <td className='d-none d-md-table-cell' onClick={() => push(routes.assetDetail(symbol))}>
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
      <td className='d-none d-md-table-cell' onClick={() => push(routes.assetDetail(symbol))}>
        <Units
          className='text-nowrap'
          value={availableSupply} 
          symbol={symbol} 
          precision={6} 
          abbreviate
        />
      </td>
      <td className='d-none d-md-table-cell' onClick={() => push(routes.assetDetail(symbol))}>
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
  timeFrame, tableHeader, defaultPriceChange, heading, showSearch, handleSortKey,
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
          <h5 className='mb-0'>{tableHeader}</h5>
          {!defaultPriceChange ? (
            <Dropdown style={{ right: 10, top: 15 }} className='position-absolute d-block d-md-none' group isOpen={isMobileDropdownOpen} size="sm" toggle={toggleMobileDropdownOpen}>
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
            </Dropdown>) : null}
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
                  <th className='border-0 d-none d-md-table-cell'></th>
                  <th onClick={() => handleSortKey('name')} className='pl-3 pl-md-5 border-0 d-none d-md-table-cell'>
                    Coin {sortKey === 'name' && (<Icon src={PriceArrowIconSvg} className={sortingArrow} rotate={sortDesc ? 'down' : 'up'} />)}
                  </th>
                  <th onClick={() => handleSortKey('price')} className='border-0 d-none d-md-table-cell'>
                    Price {sortKey === 'price' && (<Icon src={PriceArrowIconSvg} className={sortingArrow} rotate={sortDesc ? 'down' : 'up'} />)}
                  </th>
                  <th onClick={() => handleSortKey('marketCap')} className='border-0 d-none d-md-table-cell'>
                    Market Cap {sortKey === 'marketCap' && (<Icon src={PriceArrowIconSvg} className={sortingArrow} rotate={sortDesc ? 'down' : 'up'} />)}
                  </th>
                  <th onClick={() => handleSortKey('volume24')} className='border-0 d-none d-md-table-cell'>
                    Volume {sortKey === 'volume24' && (<Icon src={PriceArrowIconSvg} className={sortingArrow} rotate={sortDesc ? 'down' : 'up'} />)}
                  </th>
                  <th onClick={() => handleSortKey('availableSupply')} className='border-0 d-none d-md-table-cell'>
                    Supply {sortKey === 'availableSupply' && (<Icon src={PriceArrowIconSvg} className={sortingArrow} rotate={sortDesc ? 'down' : 'up'} />)}
                  </th>
                  <th className={classNames('border-0 d-none d-md-table-cell', !defaultPriceChange ? 'p-0' : null)}>
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
    </Card>
  </Fragment>
)

export default compose(
  setDisplayName('AssetIndexTable'),
  connect(null, {
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
    assets: [{}],
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
  withToggle('mobileDropdownOpen'),
)(AssetIndexTable)
