import React from 'react'
import { connect } from 'react-redux'
import { push as pushAction } from 'react-router-redux'
import { compose, setDisplayName, setPropTypes, lifecycle, defaultProps, withHandlers } from 'recompose'
import { Table, Media } from 'reactstrap'
import PropTypes from 'prop-types'
import classNames from 'class-names'

import Units from 'Components/Units'
import ChangePercent from 'Components/ChangePercent'
import ArrowIcon from 'Components/ArrowIcon'
import CoinIcon from 'Components/CoinIcon'

import { indexTable } from './style'

const TableRow = ({ asset: { symbol, availableSupply, name, 
  marketCap, price, change24, volume24 }, 
  rank, push, ...props }) => {
  return (
    <tr onClick={() => push(`/asset/${symbol}`)} {...props}>
      <td>{rank}</td>
      <td colSpan='1'>
        <Media>
          <Media left>
            <CoinIcon 
              className='mr-2 mt-2' 
              symbol={symbol} 
              style={{ width: '25px', height: '25px' }} 
              inline
            /> 
          </Media>
          <Media style={{ position: 'relative', top: '-2px' }} body>
              <h6 className='m-0 mt-1 text-white'>{name}</h6>
            <small style={{ position: 'relative', top: '-2px' }} className='text-muted'>[{symbol}]</small>
          </Media>
        </Media>
      </td>
      <td>
        <Units
          className='text-nowrap'
          value={marketCap} 
          symbol={'$'} 
          precision={6} 
          prefixSymbol
          abbreviate
        />
      </td>
      <td>
        <Units
          className='text-nowrap'
          value={volume24} 
          symbol={'$'} 
          precision={6} 
          prefixSymbol
          abbreviate
        />
      </td>
      <td>
        <Units
          className='text-nowrap'
          value={availableSupply} 
          symbol={symbol} 
          precision={6} 
          abbreviate
        />
      </td>
      <td colSpan='1'>
        <Units 
          className='mt-1 d-inline-block'
          value={price} 
          symbol={'$'} 
          precision={6} 
          prefixSymbol
        />
        <div>
          <small><ChangePercent>{change24}</ChangePercent></small>
          <ArrowIcon
            style={{ position: 'relative', top: '0px' }}
            className={classNames('swapChangeArrow', change24.isZero() ? 'd-none' : null)} 
            size={.58} dir={change24 < 0 ? 'down' : 'up'} 
            color={change24 < 0 ? 'danger' : change24 > 0 ? 'success' : null}
          />
        </div>
      </td>
    </tr>
  )
}

const AssetIndexTable = ({ assets, push }) => (
  <Table hover striped responsive className={indexTable}>
    <thead>
      <tr>
        <th>#</th>
        <th>Coin</th>
        <th>Market Cap</th>
        <th>Volume</th>
        <th>Supply</th>
        <th>Price</th>
      </tr>
    </thead>
    <tbody>
      {assets.length === 0 ? (
        <tr className='text-center'>
          <td colSpan='10'>
            <i>No assets to show. Please refresh.</i>
          </td>
        </tr>
      ) : assets.map((asset, i) => (
        <TableRow 
          key={asset.symbol} 
          asset={asset} 
          rank={i + 1}
          push={push}
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
    withHandlers({
    }),
    lifecycle({
    }),
  )(AssetIndexTable)
