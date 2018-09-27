import React, { Fragment } from 'react'
import { isEmpty } from 'lodash'
import { connect } from 'react-redux'
import { push as pushAction } from 'react-router-redux'
import { compose, setDisplayName, lifecycle, setPropTypes, defaultProps, withProps, withHandlers } from 'recompose'
import classNames from 'class-names'
import { createStructuredSelector } from 'reselect'
import routes from 'Routes'
import Expandable from 'Components/Expandable'
import CoinIcon from 'Components/CoinIcon'
import ProgressBar from 'Components/ProgressBar'
import SwapStatusCard from 'Components/SwapStatusCard'
import { Button, Input, Col, Row, Card, CardHeader, CardBody } from 'reactstrap'
import { container, section, submitButton, asset, icon, receive, qr, scan } from './style.scss'
import { toBigNumber } from 'Utilities/convert'
import QRCode from 'qrcode.react'
import toastr from 'Utilities/toastrWrapper'
import SwapIcon from 'Img/swap-icon.svg?inline'
import { fetchManualSwap } from 'Actions/swap'
import { getSwap } from 'Selectors/swap'
import PropTypes from 'prop-types'

const SwapStepTwo = ({ swap, handleRef, handleFocus, handleCopy, handleTrackSwap }) => {
  swap = swap ? swap : {}
  const { id = '', sendSymbol = '', depositAddress = '', receiveSymbol = '', amountDeposited = '' } = swap
  console.log(swap)
  return (
    <Fragment>
        <ProgressBar steps={['Create Swap', `Deposit ${sendSymbol}`, `Receive ${receiveSymbol}`]} currentStep={1}/>
        <Card className={classNames('container justify-content-center p-0', container)}>
        <CardHeader className='text-center'>
            <h4> Deposit 
           <CoinIcon key={sendSymbol} symbol={sendSymbol} size='sm' className='ml-2 mr-1 mb-1' inline/> 
           {amountDeposited > 0 ? amountDeposited : null} {sendSymbol} to Address:</h4>
        </CardHeader>
        <CardBody className='pt-1 text-center'>
        
         <div className={classNames('mt-3', qr)}>
           <div className={scan}></div>
           <QRCode size={150} level='L' value={depositAddress}/>
         </div>
         <Row className='gutter-2 mb-4 mt-2'>
           <Col>
             <Input type='text' autoFocus readOnly onFocus={handleFocus} innerRef={handleRef} value={depositAddress}/>
          </Col>
          <Col xs='auto'>
            <Button color='link' className='p-2' onClick={handleCopy}><i className='fa fa-copy'/></Button>
          </Col>
         </Row>
         <div>
           <Button onClick={() => handleTrackSwap(id)} className={classNames('mt-4 mb-2 mx-auto', submitButton)} color='primary'>Track Swap</Button>
           <small className='text-muted'>* Track swap after you have deposited {sendSymbol} to the generated wallet address</small>
         </div>
        </CardBody>
      </Card>
    </Fragment>
  )
}

export default compose(
  setDisplayName('SwapStepTwo'),
  connect(createStructuredSelector({
    swap: (state, { swapId }) => getSwap(state, swapId)
  }), {
    fetchManualSwap: fetchManualSwap,
    push: pushAction
  }),
  setPropTypes({
    swapId: PropTypes.string,
  }),
  defaultProps({
    swapId: ''
  }),
  withHandlers(() => {
    let inputRef
    return {
      handleRef: () => (ref) => {
        inputRef = ref
      },
      handleFocus: () => (event) => {
        event.target.select()
      },
      handleCopy: () => () => {
        inputRef.select()
        document.execCommand('copy')
        toastr.info('Address copied to clipboard')
      },
      handleTrackSwap: ({ push }) => (orderId) => push(routes.tradeDetail(orderId)),
    }
  }),
  lifecycle({
    componentWillMount() {
      const { swapId, fetchManualSwap } = this.props
      fetchManualSwap(swapId)
    }
  })
)(SwapStepTwo)
