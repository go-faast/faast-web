import React from 'react'
import PropTypes from 'prop-types'
import { compose, setDisplayName, setPropTypes, withStateHandlers } from 'recompose'
import {
  Table, Button, Collapse
} from 'reactstrap'
import classNames from 'class-names'

import display from 'Utilities/display'

import ChangePercent from 'Components/ChangePercent'
import Units from 'Components/Units'
import CoinIcon from 'Components/CoinIcon'
import PriceChart from 'Components/PriceChart'

import { tableStyle, expandedOnly, collapsedOnly, collapsedRow } from './style'

const renderAssetRows = ({ assetRows, openCharts, toggleChart }) => {
  return assetRows.map((asset) => {
    const { symbol, name, fiat, balance, price, percentage, change24, infoUrl } = asset
    const displayName = name.length > 12 ? symbol : name
    const displayUnits = (<Units value={balance} symbol={symbol} showSymbol={false}/>)
    const displayWeight = display.percentage(percentage)
    const displayChange = (<ChangePercent>{change24}</ChangePercent>)
    const fiatValue = display.fiat(fiat)
    const fiatPrice = display.fiat(price)
    const chartOpen = openCharts[symbol]
    return ([
      <tr key={symbol} onClick={() => toggleChart(symbol)} tabIndex='0'>
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
      </tr>,
      <tr key={`${symbol}-priceChart`} className='accordian'>
        <td colSpan='10'>
          <Collapse isOpen={chartOpen}>
            <h5 className='mb-0 mt-2 mx-2'>
              <a href={infoUrl} target='_blank' rel='noopener noreferrer'>
                <strong>{name}</strong> ({symbol}) <i className='fa fa-external-link' />
              </a>
              <Button color='link' size='sm' onClick={() => toggleChart(symbol)} className='float-right p-0'>close chart</Button>
            </h5>
            <PriceChart symbol={symbol} chartOpen={chartOpen} />
          </Collapse>
        </td>
      </tr>
    ])
  })
}

export default compose(
  setDisplayName('AssetTable'),
  setPropTypes({
    assetRows: PropTypes.arrayOf(PropTypes.object).isRequired,
  }),
  withStateHandlers(
    ({ initialOpenCharts = [] }) => ({
      openCharts: initialOpenCharts.reduce((result, symbol) => ({ ...result, [symbol]: true }), {})
    }),
    {
      toggleChart: ({ openCharts }) => (symbol) => ({
        openCharts: {
          ...openCharts,
          [symbol]: !openCharts[symbol]
        }
      })
    }
  )
)(({ assetRows, openCharts, toggleChart }) => (
  <Table hover striped responsive className={classNames(tableStyle, 'table-accordian')}>
    <thead>
      <tr>
        <th><h6>Asset</h6></th>
        <th><h6>Units</h6></th>
        <th><h6>Holdings</h6></th>
        <th className={expandedOnly}><h6>Weight</h6></th>
        <th><h6>Price</h6></th>
        <th className={expandedOnly}><h6>24h change</h6></th>
      </tr>
    </thead>
    <tbody>
      {assetRows.length === 0 ? (
        <tr className='text-center'>
          <td colSpan='10'>
            <i>No assets to show</i>
          </td>
        </tr>
      ) : renderAssetRows({ assetRows, openCharts, toggleChart })}
    </tbody>
  </Table>
))
