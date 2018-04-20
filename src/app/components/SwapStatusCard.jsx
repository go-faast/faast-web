import React from 'react'
import PropTypes from 'prop-types'
import { compose, setDisplayName, setPropTypes, defaultProps } from 'recompose'
import { Row, Col, Card, CardBody, CardFooter, Alert, Collapse, Button } from 'reactstrap'
import classNames from 'class-names'

import withToggle from 'Hoc/withToggle'
import ArrowIcon from 'Components/ArrowIcon'
import CoinIcon from 'Components/CoinIcon'
import Units from 'Components/Units'
import UnitsLoading from 'Components/UnitsLoading'
import WalletLabel from 'Components/WalletLabel'

const StatusFooter = ({ className, children, ...props }) => (
  <CardFooter className={classNames('font-size-xs py-2 px-3', className)} {...props}>
    {children}
  </CardFooter>
)

export default compose(
  setDisplayName('SwapStatusCard'),
  setPropTypes({
    swap: PropTypes.object.isRequired,
    showWalletLabels: PropTypes.bool,
    showFees: PropTypes.bool,
    showDetails: PropTypes.bool,
  }),
  defaultProps({
    showWalletLabels: true,
    showFees: false,
    showDetails: false,
  }),
  withToggle('expanded')
)(({
  swap: {
    sendWalletId, sendSymbol, sendAsset, sendUnits,
    receiveWalletId, receiveSymbol, receiveAsset, receiveUnits,
    error, friendlyError, rate, fee: swapFee, tx: { feeAmount: txFee, feeAsset: txFeeSymbol, },
    status: { details },
  },
  statusText, showDetails, isExpanded, toggleExpanded
}) => (
  <Card className='flat'>
    <CardBody className='py-2 pr-3 pl-2 border-0 lh-0' tag={Button} color='ultra-dark' onClick={toggleExpanded} style={{ minHeight: '4rem' }}>
      <Row className='gutter-0 align-items-center font-size-small text-muted'>
        <Col xs='auto'>
          <i className={classNames('fa fa-chevron-circle-down text-primary px-2 mr-2', { ['fa-rotate-180']: isExpanded })}/>
        </Col>
        <Col>
          <Row className='gutter-2 align-items-center text-center text-sm-left'>
            <Col xs='12' sm='auto'><CoinIcon symbol={sendSymbol}/></Col>
            <Col xs='12' sm>
              <Row className='gutter-2'>
                <Col xs='12' className='order-sm-2 font-size-sm'>{sendAsset.name}</Col>
                <Col xs='12' className='text-white'>
                  <Units value={sendUnits} symbol={sendSymbol} prefix='-'/>
                </Col>
              </Row>
            </Col>
          </Row>
        </Col>
        <Col xs='auto' className='text-center'>
          <ArrowIcon inline size={1.5} dir='right' color={error ? 'danger' : 'success'}/><br/>
          <small className='lh-0'>{statusText}</small>
        </Col>
        <Col>
          <Row className='gutter-2 align-items-center text-center text-sm-right'>
            <Col xs='12' sm='auto' className='order-sm-2'><CoinIcon symbol={receiveSymbol}/></Col>
            <Col xs='12' sm>
              <Row className='gutter-2'>
                <Col xs='12' className='order-sm-2 font-size-sm'>{receiveAsset.name}</Col>
                <Col xs='12' className='text-white'>
                  <UnitsLoading value={receiveUnits} symbol={receiveSymbol} error={error} prefix='+'/>
                </Col>
              </Row>
            </Col>
          </Row>
        </Col>
      </Row>
    </CardBody>
    <Collapse isOpen={isExpanded}>
      <StatusFooter>
        <table style={{ lineHeight: 1.25 }}>
          <tbody>
            <tr>
              <td><b>Sending:</b></td>
              <td className='px-2'><UnitsLoading value={sendUnits} symbol={sendSymbol} error={error} precision={null}/></td>
              <td><i>using wallet</i> <WalletLabel.Connected id={sendWalletId} tag='span' hideIcon/></td>
            </tr>
            <tr>
              <td><b>Receiving:</b></td>
              <td className='px-2'><UnitsLoading value={receiveUnits} symbol={receiveSymbol} error={error} precision={null}/></td>
              <td><i>using wallet</i> <WalletLabel.Connected id={receiveWalletId} tag='span' hideIcon/></td>
            </tr>
            <tr>
              <td><b>Rate:</b></td>
              <td colSpan='2' className='px-2'><span>1 {sendSymbol} = </span><UnitsLoading value={rate} symbol={receiveSymbol} error={error} precision={null}/></td>
            </tr>
            <tr>
              <td><b>Network fee:</b></td>
              <td colSpan='2' className='px-2'><UnitsLoading value={txFee} symbol={txFeeSymbol} error={error} precision={null} /></td>
            </tr>
            <tr>
              <td><b>Swap fee:</b></td>
              <td colSpan='2' className='px-2'><UnitsLoading value={swapFee} symbol={receiveSymbol} error={error} precision={null}/></td>
            </tr>
          </tbody>
        </table>
      </StatusFooter>
    </Collapse>
    {error 
      ? (<StatusFooter tag={Alert} color='danger' className='m-0 text-center'>{friendlyError || error}</StatusFooter>)
      : (showDetails && details && (
          <StatusFooter className='text-center text-muted'>{details}</StatusFooter>
        ))}
  </Card>
))
