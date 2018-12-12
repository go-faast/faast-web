import React from 'react'
import PropTypes from 'prop-types'
import { compose, setDisplayName, setPropTypes, defaultProps, withProps } from 'recompose'
import { Row, Col } from 'reactstrap'
import classNames from 'class-names'

import ChangePercent from 'Components/ChangePercent'
import ArrowIcon from 'Components/ArrowIcon'
import PriceArrowIcon from 'Components/PriceArrowIcon'
import CoinIcon from 'Components/CoinIcon'
import Units from 'Components/Units'
import UnitsLoading from 'Components/UnitsLoading'
import Spinner from 'Components/Spinner'

const priceChange = (date, asset) => {
  const { change1, change7d, change24 } = asset
  // falsey date => hasn't loaded yet so default to 1h change
  date = new Date(date)
  const hoursSinceTrade = !date ? 0 : (Date.now() - date.getTime()) / 3600000
  const timespan = hoursSinceTrade <= 1 ? 'Last 1hr: ' : hoursSinceTrade >= 24 ? 'Last 7d: ' : 'Last 24hrs: '
  var priceChange = hoursSinceTrade <= 1 ? change1 : hoursSinceTrade >= 24 ? change7d : change24
  return (
    <span>{timespan}
      <ChangePercent>{priceChange}</ChangePercent>
      <PriceArrowIcon 
        className={classNames('swapChangeArrow', priceChange.isZero() ? 'd-none' : null)} 
        size={.58} dir={priceChange < 0 ? 'down' : 'up'} 
        color={priceChange < 0 ? 'danger' : priceChange > 0 ? 'success' : null}
      />
    </span>
  )
}

const getShortStatus = (swap) => {
  const { tx, status: { code, detailsCode, labelClass, label } } = swap
  if (detailsCode === 'signed') {
    return (<span className='text-success'>Signed</span>)
  } else if (detailsCode === 'signing_unsupported') {
    return (<span className='text-success'>Ready</span>)
  } else if (detailsCode === 'signing') {
    return (<span className='text-warning blink'>Awaiting signature</span>)
  } else if (detailsCode.includes('error')) {
    return (<span className='text-danger'>Failed</span>)
  } else if (detailsCode === 'sending') {
    return (<span className='text-primary'>Sending</span>)
  } else if ((tx && tx.sent) || code === 'failed') {
    return (<span className={labelClass}>{label}</span>)
  } else if (detailsCode === 'unsigned') {
    return null
  } else if (detailsCode === 'creating_tx' || detailsCode === 'fetching_rate') {
    return (<Spinner size='sm' inline/>)
  }
  return (<span>{label || code}</span>)
}

export default compose(
  setDisplayName('SwapStatus'),
  setPropTypes({
    swap: PropTypes.object.isRequired,
    showShortStatus: PropTypes.bool,
    hideChange: PropTypes.bool,
    before: PropTypes.node,
    after: PropTypes.node,
  }),
  defaultProps({
    showShortStatus: false,
    hideChange: false,
    before: null,
    after: null,
  }),
  withProps(({ swap }) => ({
    shortStatus: getShortStatus(swap),
  })),
)(({
  swap: {
    sendSymbol, sendAmount, sendAsset, createdAt, receiveSymbol, receiveAsset, receiveAmount, error,
  },
  before, after, shortStatus, showShortStatus, hideChange, className,
}) => (
  <Row className={classNames('gutter-0 align-items-center font-size-small text-muted lh-0', className)}>
    {before}
    <Col>
      <Row className='gutter-2 align-items-center text-center text-sm-left'>
        <Col xs='12' sm='auto'><CoinIcon symbol={sendSymbol}/></Col>
        <Col xs='12' sm>
          <Row className='gutter-2'>
            <Col xs='12' className='order-sm-2 font-size-sm pt-0'>{sendAsset.name}</Col>
            {sendAmount ? (<Col xs='12' className='text-white'>
              <Units value={sendAmount} symbol={sendSymbol} prefix='-'/>
            </Col>) : null}
            {sendAsset && !hideChange ? (<Col xs='12' className='mt-0 pt-0 order-sm-3 font-size-xs'>{priceChange(createdAt, sendAsset)}</Col>)
              : null}
          </Row>
        </Col>
      </Row>
    </Col>
    <Col xs='auto' className='text-center'>
      <ArrowIcon inline size={1.5} dir='right' color={error ? 'danger' : 'success'}/><br/>
      {showShortStatus && (<small className='lh-0'>{shortStatus}</small>)}
    </Col>
    <Col>
      <Row className='gutter-2 align-items-center text-center text-sm-right'>
        <Col xs='12' sm='auto' className='order-sm-2'><CoinIcon symbol={receiveSymbol}/></Col>
        <Col xs='12' sm>
          <Row className='gutter-2'>
            <Col xs='12' className='order-sm-2 font-size-sm pt-0'>{receiveAsset ? receiveAsset.name : receiveSymbol}</Col>
            {receiveAmount ? (<Col xs='12' className='text-white'>
              <UnitsLoading value={receiveAmount} symbol={receiveSymbol} error={error} prefix='+'/>
            </Col>) : null}
            {receiveAsset && !hideChange  ? (<Col xs='12' className='mt-0 pt-0 order-sm-3 font-size-xs'>{priceChange(createdAt, receiveAsset)}</Col>)
              : null}
          </Row>
        </Col>
      </Row>
    </Col>
    {after}
  </Row>
))
