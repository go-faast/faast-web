import React from 'react'
import routes from 'Routes'
import { connect } from 'react-redux'
import { push as pushAction } from 'react-router-redux'
import { compose, setDisplayName, setPropTypes, defaultProps, withState } from 'recompose'
import { Table, Media, Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap'
import PropTypes from 'prop-types'
import classNames from 'class-names'
import withToggle from 'Hoc/withToggle'

import Units from 'Components/Units'
import ChangePercent from 'Components/ChangePercent'
import ArrowIcon from 'Components/ArrowIcon'
import CoinIcon from 'Components/CoinIcon'
import Expandable from 'Components/Expandable'
import WatchlistStar from 'Components/WatchlistStar'

import { indexTable, mediaBody } from './style'

const TableRow = ({ asset: { symbol, availableSupply, name, 
  marketCap, price, change24, volume24, change7d, change1 }, timeFrame, push, ...props }) => {
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
          className='text-nowrap'
          value={marketCap} 
          symbol={'$'} 
          precision={6} 
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
        <Units 
          className='mt-1 d-inline-block'
          value={price} 
          symbol={'$'} 
          precision={6} 
          prefixSymbol
        />
        <div>
          <small><ChangePercent>{percentChange}</ChangePercent></small>
          <ArrowIcon
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

const AssetIndexTable = ({ assets, push, toggleDropdownOpen, isDropdownOpen, updateTimeFrame, timeFrame }) => (
  <Table hover striped responsive className={indexTable}>
    <thead>
      <tr>
        <th></th>
        <th className='pl-3 pl-md-5'>Coin</th>
        <th>Market Cap</th>
        <th>Volume</th>
        <th>Supply</th>
        <th>
          Price
          <Dropdown group isOpen={isDropdownOpen} size="sm" toggle={toggleDropdownOpen}>
            <DropdownToggle className='py-0 px-2 ml-2 flat' color='dark' caret>
              {timeFrame}
            </DropdownToggle>
            <DropdownMenu>
              <DropdownItem onClick={() => updateTimeFrame('7d')}>7d</DropdownItem>
              <DropdownItem onClick={() => updateTimeFrame('1d')}>1d</DropdownItem>
              <DropdownItem onClick={() => updateTimeFrame('1h')}>1h</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </th>
      </tr>
    </thead>
    <tbody>
      {assets.length === 0 ? (
        <tr className='text-center'>
          <td colSpan='10'>
            <i>No assets to show. Please refresh.</i>
          </td>
        </tr>
      ) : assets.map((asset) => (
        <TableRow 
          key={asset.symbol} 
          asset={asset} 
          push={push}
          timeFrame={timeFrame}
        />
      )
      )}
    </tbody>
  </Table>
)

export default compose(
  setDisplayName('AssetIndexTable'),
  connect(null, {
    push: pushAction
  }),
  setPropTypes({
    assets: PropTypes.arrayOf(PropTypes.object).isRequired
  }),
  defaultProps({
    assets: []
  }),
  withState('timeFrame', 'updateTimeFrame', '1d'),
  withToggle('dropdownOpen'),
)(AssetIndexTable)
