import React, { Fragment } from 'react'
import { createStructuredSelector } from 'reselect'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { withRouter } from 'react-router'
import { compose, setDisplayName, setPropTypes, defaultProps } from 'recompose'
import { Table, Card, CardHeader, CardBody, CardFooter, Row, Col } from 'reactstrap'
import PropTypes from 'prop-types'
import classNames from 'class-names'
import ChangePercent from 'Components/ChangePercent'
import { toBigNumber } from 'Utilities/numbers'
import { createStatusLabel, CoinSymbol } from 'Components/TradeTable'
import Loading from 'Components/Loading'
import Units from 'Components/Units'

import { getMakerSwaps } from 'Actions/maker'
import { makerSwapsArray, areSwapsLoading } from 'Selectors/maker'

import { text, affilateTable, card, cardHeader, cardFooter, smallCard } from './style'

const NODATA = '---'

const TableRow = ({
  swap, size,
  swap: { sendSymbol, receiveSymbol, createdAtFormatted, valueUsd, valueBtc, revenueMakerBtc },
  ...props
}) => {
  const revenueUsd = toBigNumber(valueUsd).div(valueBtc).times(revenueMakerBtc)
  const percentGain = revenueUsd.div(valueUsd).times(100)
  const swapStatus = swap && swap.status
  const isComplete = swapStatus && swapStatus.detailsCode == 'complete'
  if (swapStatus && swapStatus.detailsCode == 'contact_support') {
    swap.status.detailsCode = 'pending'
  }
  return (
    <tr {...props}>
      <td><span className='position-relative' style={{ left: 8 }}>{createStatusLabel(swap)}</span></td>
      {size === 'large' && (<td className='d-none d-sm-table-cell'>{createdAtFormatted}</td>)}
      <td className='d-none d-sm-table-cell'>
        <CoinSymbol symbol={sendSymbol}/>
        <i className='fa fa-long-arrow-right text-grey mx-2'/> 
        <CoinSymbol symbol={receiveSymbol}/>
      </td>
      <td>{valueUsd && !toBigNumber(valueUsd).isNaN() && (toBigNumber(valueUsd).gt(0) || isComplete)
        ? (<Units value={toBigNumber(valueUsd)} symbol={'$'} precision={6} showSymbol currency prefixSymbol symbolSpaced={false} />)
        : NODATA}
      </td>
      <td>{revenueUsd && !revenueUsd.isNaN()
        ? (<Units value={revenueUsd} symbol={'$'} precision={6} showSymbol prefixSymbol symbolSpaced={false} currency />)
        : NODATA}
      </td>
      {size === 'large' && (
        <td>{percentGain && !percentGain.isNaN()
          ? (<ChangePercent>{percentGain}</ChangePercent>)
          : NODATA}
        </td>
      )}
    </tr>
  )}

const AffiliateSwapsTable = ({ swaps, size, areSwapsLoading, title }) => {
  swaps = swaps && size === 'small' ? swaps.slice(0,6) : swaps
  return (
    <Fragment>
      <Card className={classNames(card, size === 'small' && smallCard, size !== 'small' && 'mx-auto')}>
        <CardHeader className={cardHeader}>
          <Row>
            <Col>{title}</Col>
          </Row>
        </CardHeader>
        <CardBody className={classNames(swaps.length > 0 && 'p-0','text-center')}>
          {areSwapsLoading ? (<Loading className='py-4' />) :
            swaps.length > 0 ? (
              <Fragment>
                <Table className={classNames('text-left', text, affilateTable)} striped responsive>
                  <thead>
                    <tr>
                      <th></th>
                      {size === 'large' ? (<th className='d-none d-sm-table-cell'>Date</th>) : null}
                      <th className='d-none d-sm-table-cell'>Pair</th>
                      <th>Swap Value (USD)</th>
                      <th>Reward (USD)</th>
                      {size === 'large' ? (<th>% Reward</th>) : null}
                    </tr>
                  </thead>
                  <tbody>
                    {swaps.map(swap => {
                      return (
                        <TableRow key={swap.orderId} size={size} swap={swap}/>
                      )
                    })}
                  </tbody>
                </Table>
                {size === 'small' && (
                  <CardFooter 
                    tag={Link} 
                    to='/affiliates/swaps'
                    className={classNames(cardFooter, text, swaps.length <= 5 && 'position-absolute', 'p-2 text-center cursor-pointer d-block w-100')}
                    style={{ bottom: 0 }}
                  >
                    <span className='font-weight-bold'>View All Swaps</span>
                  </CardFooter>)}
              </Fragment>) :
              <div className='d-flex align-items-center justify-content-center'>
                <p className={text}>No swaps yet.</p>
              </div>
          }
        </CardBody>
      </Card>
    </Fragment>
  )
}

export default compose(
  setDisplayName('AffiliateSwapsTable'),
  connect(createStructuredSelector({
    swaps: makerSwapsArray,
    areSwapsLoading,
  }), {
    getMakerSwaps,
  }),
  setPropTypes({
    size: PropTypes.string
  }),
  defaultProps({
    size: 'large'
  }),
  withRouter,
)(AffiliateSwapsTable)
