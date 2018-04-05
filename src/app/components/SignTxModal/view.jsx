import React from 'react'
import PropTypes from 'prop-types'
import { reduxForm } from 'redux-form'
import { connect } from 'react-redux'
import {
  Row, Col, Button, Form, Card, CardBody, CardFooter,
  Modal, ModalHeader, ModalBody, ModalFooter
} from 'reactstrap'
import { isNil } from 'lodash'

import { getWallet } from 'Selectors'

import Spinner from 'Components/Spinner'
import Units from 'Components/Units'
import Icon from 'Components/Icon'
import CoinIcon from 'Components/CoinIcon'
import ReduxFormField from 'Components/ReduxFormField'

const SignTxModal = (props) => {
  const renderView = () => {
    switch (props.view) {
      case 'EthereumWalletKeystore':
        return (
          <SignTxForm
            buttonText='I agree'
            passwordPrompt
            {...props.signTxProps}
          />
        )
      case 'EthereumWalletTrezor':
      case 'EthereumWalletLedger':
        return (
          <SignTxForm
            buttonText='Approve & Sign'
            {...props.signTxProps}
          />
        )
      case 'EthereumWalletWeb3':
        return (
          <SignTxForm
            buttonText='Approve & Sign'
            {...props.signTxProps}
          />
        )
      case 'blockstack':
        return (
          <SignTxForm
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
            buttonText='Approve & Sign'
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

let SwapStatusRow = ({
  swap: { sendAsset, sendUnits, receiveAsset, receiveUnits },
  showWalletLabels, sendWallet, receiveWallet, children
}) => (
  <Row className='gutter-0 align-items-center font-size-small text-muted'>
    <Col>
      <Row className='gutter-2 align-items-center text-center text-sm-left'>
        {showWalletLabels && (
          <Col xs='12' className='font-size-sm'>{sendWallet.label}</Col>
        )}
        <Col xs='12' sm='auto'><CoinIcon symbol={sendAsset.symbol}/></Col>
        <Col xs='12' sm>
          <Row className='gutter-2'>
            <Col xs='12' className='order-sm-2 font-size-sm'>{sendAsset.name}</Col>
            <Col xs='12' className='text-white'><Units value={sendUnits} symbol={sendAsset.symbol}/></Col>
          </Row>
        </Col>
      </Row>
    </Col>
    <Col xs='auto' className='text-center'>
      {children}
    </Col>
    <Col>
      <Row className='gutter-2 align-items-center text-center text-sm-right'>
        {showWalletLabels && (
          <Col xs='12' className='font-size-sm'>{receiveWallet.label}</Col>
        )}
        <Col xs='12' sm='auto' className='order-sm-2'><CoinIcon symbol={receiveAsset.symbol}/></Col>
        <Col xs='12' sm>
          <Row className='gutter-2'>
            <Col xs='12' className='order-sm-2 font-size-sm'>{receiveAsset.name}</Col>
            <Col xs='12' className='text-white'>
              {!isNil(receiveUnits)
                ? <Units value={receiveUnits} symbol={receiveAsset.symbol}/>
                : ' '}
            </Col>
          </Row>
        </Col>
      </Row>
    </Col>
  </Row>
)

SwapStatusRow = connect((state, props) => ({
  sendWallet: getWallet(state, props.swap.sendWalletId),
  receiveWallet: getWallet(state, props.swap.receiveWalletId),
}))(SwapStatusRow)

SwapStatusRow.propTypes = {
  showWalletLabels: PropTypes.bool,
}

SwapStatusRow.defaultProps = {
  showWalletLabels: true
}

const SigningStatusCard = ({ swap, status }) => {
  const { sendSymbol, receiveSymbol, rate, displayFee, displayTxFee, error } = swap
  return (
    <Card className='flat lh-0'>
      <CardBody className='py-2 px-3'>
        <SwapStatusRow swap={swap}>
          <Icon tag='div' src='https://faa.st/img/right-icon.svg' size='md' className='m-auto'/>
          {status}
        </SwapStatusRow>
      </CardBody>
      <CardFooter className='font-size-xs text-muted py-2 px-3'>
        <Row className='gutter-2'>
          <Col xs='6' sm>
            <span className='mr-2'>txn fee</span>
            {!isNil(displayTxFee)
              ? displayTxFee
              : (error
                  ? (<span className='text-danger'> - </span>)
                  : (<Spinner inline size='sm'/>))
            }
          </Col>
          <Col xs='12' sm='auto' className='text-center order-3 order-sm-2'>{error
            ? (<span className='text-danger'>{error}</span>)
            : (!isNil(rate)
                ? `1 ${sendSymbol} = ${rate} ${receiveSymbol}`
                : (<Spinner inline size='sm'/>))
            }
          </Col>
          <Col xs='6' sm className='text-right order-2 order-sm-3'>
            <span className='mr-2'>swap fee</span>
            {!isNil(displayFee)
              ? displayFee
              : (error
                  ? (<span className='text-danger'> - </span>)
                  : (<Spinner inline size='sm'/>))
            }
          </Col>
        </Row>
      </CardFooter>
    </Card>
  )
}

const SignTxForm = reduxForm({
  form: 'signTxForm'
})((props) => {
  let nextToSign = 0
  const signingStatuses = props.swapList.map((swap, i) => {
    let status
    if (swap.tx && swap.tx.signed) {
      nextToSign += 1
      status = (<div className='text-success'>signed</div>)
    } else if (swap.error) {
      nextToSign += 1
      status = (<div className='text-danger'>declined</div>)
    } else if (props.isSigning && i === nextToSign) {
      status = (<div className='text-warning blink'>awaiting signature</div>)
    }
    return (
      <Col xs='12' key={i}>
        <SigningStatusCard swap={swap} status={status}/>
      </Col>
    )
  })
  return (
    <Form onSubmit={props.handleSubmit}>
      <ModalHeader className='text-primary'>
        Review and Sign
      </ModalHeader>
      <ModalBody className='modal-text'>
        <p>
          The following swaps will take place to save the changes you made to your wallet. Please review them and click {`"${props.buttonText}"`} to proceed.
        </p>
        <div className='review-list my-3'>
          <Row className='gutter-2'>
            {signingStatuses}
          </Row>
        </div>
        {props.passwordPrompt &&
          <Row className='justify-content-center'>
            <Col xs='12' md='8' lg='6' xl='5'>
              <ReduxFormField
                name='password'
                type='password'
                label='Wallet Password'
                placeholder='Enter password to sign transactions...'
              />
            </Col>
          </Row>
        }
        <p><small className='text-muted'>
          The receive amount is an estimate based on the current Faast market rate and swap fee. Actual amount may vary.
        </small></p>
      </ModalBody>
      <ModalFooter className='justify-content-between'>
        <Button color='primary' outline onClick={props.handleCancel}>cancel</Button>
        <Button color='primary'
          disabled={!props.readyToSign || props.isSigning}
          onClick={props.handleSubmit}>
          {props.buttonText}
        </Button>
      </ModalFooter>
    </Form>
  )
})

const OrderStatus = ({ swapList, handleClose }) => (
  <div>
    <ModalHeader className='text-primary' toggle={handleClose}>
      Order Status
    </ModalHeader>
    <ModalBody className='text-center'>
      <div className='review-list pb-3'>
        <Row className='gutter-2'>
          {swapList.map((swap) => (
            <Col xs='12' key={swap.id}>
              <Card body className='py-2 px-3 flat'>
                <SwapStatusRow swap={swap}>
                  <div className={`status mt-1 ${swap.status.cl}`}>{swap.status.text}</div>
                  <div>{swap.status.details}</div>
                </SwapStatusRow>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
      <div className='text-center'>
        <Button color='link' onClick={handleClose}>hide</Button>
      </div>
    </ModalBody>
  </div>
)

export default SignTxModal
