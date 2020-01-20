import React, { Fragment } from 'react'
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
import WatchlistStar from 'Components/WatchlistStar'
import T from 'Components/i18n/T'

import { tableStyle, expandedOnly, collapsedOnly, collapsedRow } from './style'

const renderAssetRows = ({ assetRows, push }) => {
  return assetRows.map((asset) => {
    const { symbol, name, fiat, balance, price, percentage, change24 } = asset
    const displayName = name.length > 12 ? symbol : name
    const displayUnits = (<Units value={balance} symbol={symbol} showSymbol={false}/>)
    const displayWeight = display.percentage(percentage)
    const displayChange = (<ChangePercent>{change24}</ChangePercent>)
    const fiatValue = fiat
    const fiatPrice = price
    return (
      <tr 
        className='cursor-pointer'
        key={symbol} 
        tabIndex='0'
      >
        <td colSpan='auto'>
          <WatchlistStar
            symbol={symbol}
          />
        </td>
        <td onClick={() => push(routes.assetDetail(symbol))} >
          <CoinIcon symbol={symbol} width='1.5em' height='1.5em' size={1} inline/>
          <span className='mx-2 text-truncate'>{displayName}</span>
        </td>
        <td onClick={() => push(routes.assetDetail(symbol))} >
          {displayUnits}
          <span className={collapsedRow}>&nbsp;{symbol}</span>
        </td>
        <td onClick={() => push(routes.assetDetail(symbol))} >
          <Units value={fiatValue} precision={6} symbolSpaced={false} includeTrailingZeros prefixSymbol currency />
          <div className={classNames(collapsedOnly, collapsedRow)}>{displayWeight}</div>
        </td>
        <td onClick={() => push(routes.assetDetail(symbol))} className={expandedOnly}>
          {displayWeight}
        </td>
        <td onClick={() => push(routes.assetDetail(symbol))} >
          <Units value={fiatPrice} precision={5} symbolSpaced={false} includeTrailingZeros prefixSymbol currency />
          <div className={classNames(collapsedOnly, collapsedRow)}>{displayChange}</div>
        </td>
        <td onClick={() => push(routes.assetDetail(symbol))} className={expandedOnly}>
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
  <Fragment>
    {assetRows.length === 0 ? (
      <p className='text-center mt-3'>
        <T tag='i' i18nKey='app.assetTable.noAssets'>No assets to show</T>
      </p>
    ) : (
      <Table hover striped responsive className={tableStyle}>
        <thead>
          <tr>
            <th className='border-0'></th>
            <th className='border-0'><T tag='h6' i18nKey='app.assetTable.th1'>Asset</T></th>
            <th className='border-0'><T tag='h6' i18nKey='app.assetTable.th2'>Units</T></th>
            <th className='border-0'><T tag='h6' i18nKey='app.assetTable.th3'>Holdings</T></th>
            <th className={classNames(expandedOnly, 'border-0')}><T tag='h6' i18nKey='app.assetTable.th4'>Weight</T></th>
            <th className='border-0'><T tag='h6' i18nKey='app.assetTable.th5'>Price</T></th>
            <th className={classNames(expandedOnly, 'border-0')}><T tag='h6' i18nKey='app.assetTable.th6'>24h change</T></th>
          </tr>
        </thead>
        <tbody>
          {renderAssetRows({ assetRows, push })}
        </tbody>
      </Table>
    )}
  </Fragment>
))
