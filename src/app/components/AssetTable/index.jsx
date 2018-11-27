import React from 'react'
import PropTypes from 'prop-types'
import { push as pushAction } from 'react-router-redux'
import { connect } from 'react-redux'
import { compose, setDisplayName, setPropTypes } from 'recompose'
import { Table } from 'reactstrap'
import classNames from 'class-names'

import routes from 'Routes'
import display from 'Utilities/display'

import ChangePercent from 'Components/ChangePercent'
import Units from 'Components/Units'
import CoinIcon from 'Components/CoinIcon'

import { tableStyle, expandedOnly, collapsedOnly, collapsedRow } from './style'

const renderAssetRows = ({ assetRows, push }) => {
  return assetRows.map((asset) => {
    const { symbol, name, fiat, balance, price, percentage, change24 } = asset
    const displayName = name.length > 12 ? symbol : name
    const displayUnits = (<Units value={balance} symbol={symbol} showSymbol={false}/>)
    const displayWeight = display.percentage(percentage)
    const displayChange = (<ChangePercent>{change24}</ChangePercent>)
    const fiatValue = display.fiat(fiat)
    const fiatPrice = display.fiat(price)
    return (
      <tr 
        className='cursor-pointer'
        key={symbol} 
        onClick={() => push(routes.assetDetail(symbol))} 
        tabIndex='0'
      >
        <td>
          <CoinIcon symbol={symbol} width='1.5em' height='1.5em' size={1} inline/>
          <span className='mx-2 text-truncate'>{displayName}</span>
        </td>
        <td>
          {displayUnits}
          <span className={collapsedRow}>&nbsp;{symbol}</span>
        </td>
        <td>
          {fiatValue}
          <div className={classNames(collapsedOnly, collapsedRow)}>{displayWeight}</div>
        </td>
        <td className={expandedOnly}>
          {displayWeight}
        </td>
        <td>
          {fiatPrice}
          <div className={classNames(collapsedOnly, collapsedRow)}>{displayChange}</div>
        </td>
        <td className={expandedOnly}>
          {displayChange}
        </td>
      </tr>
    )
  })
}

export default compose(
  setDisplayName('AssetTable'),
  connect(null, {
    push: pushAction
  }),
  setPropTypes({
    assetRows: PropTypes.arrayOf(PropTypes.object).isRequired,
  })
)(({ assetRows, push }) => (
  <Table hover striped responsive className={classNames(tableStyle)}>
    <thead>
      <tr>
        <th className='border-0'><h6>Asset</h6></th>
        <th className='border-0'><h6>Units</h6></th>
        <th className='border-0'><h6>Holdings</h6></th>
        <th className={classNames(expandedOnly, 'border-0')}><h6>Weight</h6></th>
        <th className='border-0'><h6>Price</h6></th>
        <th className={classNames(expandedOnly, 'border-0')}><h6>24h change</h6></th>
      </tr>
    </thead>
    <tbody>
      {assetRows.length === 0 ? (
        <tr className='text-center'>
          <td colSpan='10'>
            <i>No assets to show</i>
          </td>
        </tr>
      ) : renderAssetRows({ assetRows, push })}
    </tbody>
  </Table>
))
