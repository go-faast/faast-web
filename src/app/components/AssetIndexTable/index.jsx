import React from 'react'
import routes from 'Routes'
import { connect } from 'react-redux'
import { push as pushAction } from 'react-router-redux'
import { compose, setDisplayName, setPropTypes, defaultProps, withState } from 'recompose'
import { Table, Media, Dropdown, DropdownToggle, DropdownMenu, 
  DropdownItem, Card, CardHeader, CardBody } from 'reactstrap'
import PropTypes from 'prop-types'
import classNames from 'class-names'
import withToggle from 'Hoc/withToggle'

import Units from 'Components/Units'
import ChangePercent from 'Components/ChangePercent'
import PriceArrowIcon from 'Components/PriceArrowIcon'
import CoinIcon from 'Components/CoinIcon'
import Expandable from 'Components/Expandable'
import WatchlistStar from 'Components/WatchlistStar'

import { indexTable, mediaBody } from './style'

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

const AssetIndexTable = ({ assets, push, toggleDropdownOpen, isDropdownOpen, updateTimeFrame, timeFrame, tableHeader, defaultPriceChange }) => (
  <Card className='mb-4'>
    <CardHeader>
      <h5>{tableHeader}</h5>
    </CardHeader>
    <CardBody className='p-0'>
      <Table hover striped responsive className={indexTable}>
        <thead>
          <tr>
            <th className='border-0'></th>
            <th className='pl-3 pl-md-5 border-0'>Coin</th>
            <th className='border-0'>Market Cap</th>
            <th className='border-0'>Volume</th>
            <th className='border-0'>Supply</th>
            <th className='border-0'>
              Price
              {!defaultPriceChange ? (
                <Dropdown group isOpen={isDropdownOpen} size="sm" toggle={toggleDropdownOpen}>
                  <DropdownToggle 
                    className='py-0 px-2 ml-2 flat position-absolute' 
                    style={{ top: '-13px' }}
                    color='dark' 
                    caret
                  >
                    {timeFrame}
                  </DropdownToggle>
                  <DropdownMenu>
                    <DropdownItem className={timeFrame === '7d' ? 'text-primary' : null} onClick={() => updateTimeFrame('7d')}>7d</DropdownItem>
                    <DropdownItem className={timeFrame === '1d' ? 'text-primary' : null} onClick={() => updateTimeFrame('1d')}>1d</DropdownItem>
                    <DropdownItem className={timeFrame === '1h' ? 'text-primary' : null} onClick={() => updateTimeFrame('1h')}>1h</DropdownItem>
                  </DropdownMenu>
                </Dropdown>) : null}
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
              defaultPriceChange={defaultPriceChange}
            />
          )
          )}
        </tbody>
      </Table>
    </CardBody>
  </Card>
)

export default compose(
  setDisplayName('AssetIndexTable'),
  connect(null, {
    push: pushAction
  }),
  setPropTypes({
    assets: PropTypes.arrayOf(PropTypes.object).isRequired,
    tableHeader: PropTypes.node,
    defaultPriceChange: PropTypes.string
  }),
  defaultProps({
    assets: [],
    tableHeader: 'Assets',
    defaultPriceChange: undefined
  }),
  withState('timeFrame', 'updateTimeFrame', ({ defaultPriceChange }) => {
    if (defaultPriceChange) {
      return defaultPriceChange
    } else {
      return '1d'
    }
  }),
  withToggle('dropdownOpen'),
)(AssetIndexTable)
