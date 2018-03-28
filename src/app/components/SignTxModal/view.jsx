import React from 'react'
import { reduxForm, Field } from 'redux-form'
import { Modal, ModalBody, Row, Col, Button } from 'reactstrap'

import web3 from 'Services/Web3'

import Spinner from 'Components/Spinner'
import Units from 'Components/Units'
import CoinIcon from 'Components/CoinIcon'

const SignTxModal = (props) => {
  const renderView = () => {
    switch (props.view) {
      case 'EthereumWalletKeystore':
        return (
          <SignTxForm
            description='your wallet password'
            buttonText='I agree'
            passwordPrompt={true}
            {...props.signTxProps}
          />
        )
      case 'EthereumWalletTrezor':
      case 'EthereumWalletLedger':
        return (
          <SignTxForm
            description='your hardware wallet'
            buttonText='Sign'
            {...props.signTxProps}
          />
        )
      case 'EthereumWalletWeb3':
        return (
          <SignTxForm
            description={web3.providerName}
            buttonText='Sign'
            {...props.signTxProps}
          />
        )
      case 'blockstack':
        return (
          <SignTxForm
            description='your Blockstack wallet'
            buttonText='I agree'
            {...props.signTxProps}
          />
        )
      case 'orderStatus':
        return (
          <OrderStatus
            {...props.orderStatusProps}
          />
        )
      default:
        return (
          <SignTxForm
            description={props.view}
            buttonText='Sign and submit'
            {...props.signTxProps}
          />
        )
    }
  }
  return (
    <Modal size='lg' backdrop='static' isOpen={props.showModal}>
      {/* <ModalHeader toggle={props.handleCloseModal}></ModalHeader> */}
      {renderView()}
    </Modal>
  )
}

const SwapStatusRow = ({ status: { swap, from, to, receiveAmount }, children }) => (
  <div className='color-bg-3 text-small text-medium-grey p-2 p-md-3'>
    <Row className='gutter-0 align-items-center'>
      <Col>
        <Row className='gutter-2 align-items-center text-center text-sm-left'>
          <Col xs='12' sm='auto'><CoinIcon symbol={from.symbol}/></Col>
          <Col xs='12' sm>
            <Row className='gutter-0'>
              <Col xs='12' className='order-sm-2'>{from.name}</Col>
              <Col xs='12' className='text-white'><Units value={swap.unit} symbol={from.symbol}/></Col>
            </Row>
          </Col>
        </Row>
      </Col>
      <Col xs='auto' className='text-center'>
        {children}
      </Col>
      <Col>
        <Row className='gutter-2 align-items-center text-center text-sm-right'>
          <Col xs='12' sm='auto' className='order-sm-2'><CoinIcon symbol={to.symbol}/></Col>
          <Col xs='12' sm>
            <Row className='gutter-0'>
              <Col xs='12' className='order-sm-2'>{to.name}</Col>
              <Col xs='12' className='text-white'>
                {typeof receiveAmount !== 'undefined' && receiveAmount !== null
                  ? <Units value={receiveAmount} symbol={to.symbol}/>
                  : ' '}
              </Col>
            </Row>
          </Col>
        </Row>
      </Col>
    </Row>
  </div>
)

const SignTxForm = reduxForm({
  form: 'signTxForm'
})((props) => {
  let nextToSign = 0
  const swapRow = props.swapList.map((a, i) => {
    const sigStatus = () => {
      if (a.swap && a.swap.tx && a.swap.tx.signed) {
        nextToSign += 1
        return (
          <div className='text-gradient'>signed</div>
        )
      } else if (a.swap && a.swap.error) {
        nextToSign += 1
        return (
          <div className='text-red'>declined</div>
        )
      } else if (props.isSigning && i === nextToSign) {
        return (
          <div className='text-orange blink'>awaiting signature</div>
        )
      }
    }
    return (
      <div key={i} className='margin-top-10'>
        <SwapStatusRow status={a}>
          <div className='right-icon' />
          {sigStatus()}
        </SwapStatusRow>
        <div className='color-bg-1 text-x-small text-medium-grey p-2'>
          <Row className='gutter-2'>
            <Col xs='6' sm>
              <span className='margin-right-10'>swap fee</span>
              {a.swap.hasOwnProperty('fee')
                ? `${a.swap.fee} ${a.to.symbol}`
                : (a.error
                    ? (<span className='text-danger'> - </span>)
                    : (<Spinner inline size='sm'/>))
              }
            </Col>
            <Col xs='12' sm='auto' className='text-center order-3 order-sm-2'>{a.error
              ? (<span className='text-danger'>{a.error}</span>)
              : (a.swap.hasOwnProperty('rate')
                  ? `1 ${a.from.symbol} = ${a.swap.rate} ${a.to.symbol}`
                  : (<Spinner inline size='sm'/>))
              }
            </Col>
            <Col xs='6' sm className='text-right order-2 order-sm-3'>
              <span className='margin-right-10'>txn fee</span>
              {typeof a.txFee !== 'undefined'
                ? (typeof a.txFee === 'string' ? a.txFee : (<Units value={a.txFee} symbol={a.from.symbol}/>))
                : (a.error
                    ? (<span className='text-danger'> - </span>)
                    : (<Spinner inline size='sm'/>))
              }
            </Col>
          </Row>
        </div>
      </div>
    )
  })
  return (
    <form onSubmit={props.handleSubmit}>
      <ModalBody>
        <div className='modal-title text-center'>review and sign</div>
        <div className='modal-text text-center'>
          The following transactions will take place to save the changes you made to your wallet. Please review and sign them with {props.description}.
          <br />
          The receive amount is an estimate based on the current rate and swap fee. Actual amount may vary.
        </div>
        <div className='review-list'>
          {swapRow}
        </div>
        {props.passwordPrompt &&
          <div className='form-group d-flex justify-content-center'>
            <Field
              name='password'
              component='input'
              type='password'
              placeholder='enter your wallet password'
            />
          </div>
        }
        <div className='form-group text-center'>
          <Button color='faast'
            disabled={!props.readyToSign || props.isSigning}
            onClick={props.handleSubmit}>
            {props.buttonText}
          </Button>
        </div>
        <div className='form-group text-center'>
          <Button color='link' onClick={props.handleCancel}>cancel</Button>
        </div>
      </ModalBody>
    </form>
  )
})

const OrderStatus = (props) => {
  const statusRow = props.swapList.map((a, i) => (
    <div key={i} className='margin-top-5'>
      <SwapStatusRow status={a}>
        <div className={`status margin-top-5 ${a.status.cl}`}>{a.status.text}</div>
        <div>{a.status.details}</div>
      </SwapStatusRow>
    </div>
  ))
  return (
    <ModalBody className='text-center'>
      <div className='modal-title'>order status</div>
      <div className='review-list padding-bottom-20'>
        {statusRow}
      </div>
      <div className='form-group'>
        <Button color='link' onClick={props.handleClose}>hide</Button>
      </div>
    </ModalBody>
  )
}

export default SignTxModal
