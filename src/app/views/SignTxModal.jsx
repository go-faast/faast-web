import React from 'react'
import { reduxForm, Field } from 'redux-form'
import { Modal, ModalBody } from 'reactstrap'
import display from 'Utilities/display'
import config from 'Config'
import styles from 'Styles/SignTxModal.scss'

const SignTxModal = (props) => {
  const renderView = () => {
    switch (props.view) {
      case 'keystore':
        return (
          <SignTxForm
            onSubmit={props.handleKeystorePassword}
            description='your wallet password'
            buttonText='I agree'
            mq={props.mq}
            {...props.signTxProps}
          />
        )
      case 'hardware':
        return (
          <SignTxForm
            onSubmit={props.handleSignHardwareWallet}
            description='your hardware wallet'
            buttonText='Sign'
            {...props.signTxProps}
          />
        )
      case 'metamask':
        return (
          <SignTxForm
            onSubmit={props.handleMetaMask}
            description='MetaMask'
            buttonText='Sign'
            {...props.signTxProps}
          />
        )
      case 'blockstack':
        return (
          <SignTxForm
            onSubmit={props.handleKeystorePassword}
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
    }
  }
  return (
    <Modal size='lg' backdrop='static' isOpen={props.showModal}>
      {/* <ModalHeader toggle={props.handleCloseModal}></ModalHeader> */}
      {renderView()}
    </Modal>
  )
}

const SignTxForm = reduxForm({
  form: 'signTxForm'
})((props) => {
  const buttonStyle = {}
  if (!props.readyToSign || props.isSigning) {
    buttonStyle.opacity = 0.3
    buttonStyle.cursor = 'not-allowed'
  }

  let mq = props.mq
  let tablet = mq.sm

  let nextToSign = 0
  const swapRow = props.swapList.map((a, i) => {
    const sigStatus = () => {
      if (a.swap && a.swap.tx && a.swap.tx.signed) {
        nextToSign += 1
        return (
          <div className='text-gradient text-small'>signed</div>
        )
      } else if (a.swap && a.swap.error) {
        nextToSign += 1
        return (
          <div className='text-red text-small'>declined</div>
        )
      } else if (props.isSigning && i === nextToSign) {
        return (
          <div className='text-orange text-small blink'>awaiting signature</div>
        )
      }
    }

    return (
      <div key={i} className={tablet? 'margin-top-10' : `margin-top-10 ${styles.reviewContainerPhone}`}>
        <div className='row color-bg-3'>

          {tablet &&
            <div className='col-md-4 padding-10'>
              <div className='coin-container pull-left'>
                <div className='coin-icon margin-top-5' style={{ backgroundImage: `url(${config.siteUrl}/img/coins/coin_${a.from.symbol}.png)` }} />
                <div className='coin-info text-left'>
                  <div className='text-white text-small'>{display.units(a.swap.unit, a.from.symbol, a.from.price)}</div>
                  <div className='text-medium-grey text-small'>{a.from.name}</div>
                </div>
              </div>
            </div>
          }

          {!tablet &&
            <div className='col-md-4 padding-10'>
              <div className='coin-container pull-left'>
                <div className='coin-icon margin-top-5' style={{ backgroundImage: `url(${config.siteUrl}/img/coins/coin_${a.from.symbol}.png)` }} />
                  <div className={tablet? 'coin-info text-right': 'coin-info text-left'}>
                    <div className='text-medium-grey text-small margin-top-10'>{a.from.name}</div>
                  </div>
                </div>
                <div className='pull-right margin-top-10'>
                <div className='coin-info text-left'>
                  <div className='text-white text-small'>{display.units(a.swap.unit, a.from.symbol, a.from.price)}</div>
                </div>
              </div>
            </div>
          }

          <div className={tablet? 'col-md-4 padding-10': 'col-md-4'}>
            <div className={tablet? 'right-icon margin-top-5' :`${styles.transferIcon} margin-top-5`} />
            {sigStatus()}
          </div>

          {tablet &&
            <div className='col-md-4 padding-10'>
              <div className='coin-container pull-right'>
                <div className='coin-icon margin-top-5' style={{ backgroundImage: `url(${config.siteUrl}/img/coins/coin_${a.to.symbol}.png)` }} />
                <div className='coin-info text-right'>
                  <div className='text-white text-small'>{display.units(a.receiveAmount, a.to.symbol, a.to.price)}</div>
                  <div className='text-medium-grey text-small'>{a.to.name}</div>
                </div>
              </div>
            </div>
          }

          {!tablet &&
            <div className='col-md-4 padding-10'>
              <div className={tablet? 'coin-container pull-right' : 'coin-container pull-left'} >
                <div className='coin-icon margin-top-5' style={{ backgroundImage: `url(${config.siteUrl}/img/coins/coin_${a.to.symbol}.png)` }} />
                <div className={tablet? 'coin-info text-right': 'coin-info text-left'}>
                  <div className='text-medium-grey text-small margin-top-10'>{a.to.name}</div>
                </div>
              </div>
              <div className='pull-right margin-top-10'>
                <div className={tablet? 'coin-info text-right': 'coin-info text-left'}>
                  <div className='text-white text-small'>{display.units(a.receiveAmount, a.to.symbol, a.to.price)}</div>
                </div>
              </div>
            </div>
          }
        </div>
        <div className='row color-bg-1 text-x-small padding-5 text-medium-grey'>
          <div className='col-md-4 text-left'>
            <div className='text-medium-grey pull-left '>swap fee </div>
            {(a.swap.hasOwnProperty('fee') &&
              <div className='pull-right'>{a.swap.fee} {a.to.symbol}</div>) ||
              <div>{(!!a.error && <span className='pull-left text-danger'> - </span>) ||
                <div className='faast-loading loading-small pull-left margin-top-10' />
              }</div>
            }
          </div>
          {tablet &&
            <div className='col-md-4 text-left'>
              {(!!a.error && <span className='text-danger'>{a.error}</span>) ||
                <div>
                  {(a.swap.hasOwnProperty('rate') &&
                    <span>1 {a.from.symbol} = {a.swap.rate} {a.to.symbol}</span>) ||
                    <div className='faast-loading loading-small margin-auto margin-top-10' />
                  }
                </div>
              }
            </div>
          }
          <div className='col-md-4 text-left'>
            {(a.txFee &&
              <div className='pull-right'>{display.units(a.txFee, 'ETH')}</div>) ||
              <div>{(!!a.error && <span className='pull-right text-danger'> - </span>) ||
                <div className='faast-loading loading-small pull-right margin-top-10' />
              }</div>
            }
            <div className='text-medium-grey pull-left margin-right-10'>txn fee</div>
          </div>
          {!tablet &&
            <div className='col-md-4 text-center'>
              {(!!a.error && <span className='text-danger'>{a.error}</span>) ||
                <div>
                  {(a.swap.hasOwnProperty('rate') &&
                    <span>1 {a.from.symbol} = {a.swap.rate} {a.to.symbol}</span>) ||
                    <div className='faast-loading loading-small margin-auto margin-top-10' />
                  }
                </div>
              }
            </div>
          }
        </div>
      </div>
    )
  })
  return (
    <form onSubmit={props.handleSubmit}>
      <ModalBody className='text-center'>
        <div className='modal-title'>review and sign</div>
        <div className='modal-text'>
          The following transactions will take place to save the changes you made to your wallet. Please review and sign them with {props.description}.
          <br />
          The receive amount is an estimate based on the current rate and swap fee. Actual amount may vary.
        </div>
        <div className='review-list'>
          {swapRow}
        </div>
        {props.type === 'keystore' &&
          <div className='form-group'>
            <Field
              name='password'
              component='input'
              type='password'
              placeholder='enter your wallet password'
            />
          </div>
        }
        <div className='form-group'>
          <div style={buttonStyle} className='button-primary cursor-pointer' onClick={props.readyToSign && !props.isSigning && props.handleSubmit}>{props.buttonText}</div>
        </div>
        <div className='form-group'>
          <div className='cancel cursor-pointer' onClick={props.handleCancel}>cancel</div>
        </div>
      </ModalBody>
    </form>
  )
})

const OrderStatus = (props) => {
  const statusRow = props.swapList.map((a, i) => (
    <div key={i} className='margin-top-5'>
      <div className='row color-bg-3'>
        <div className='col-md-4 padding-10'>
          <div className='coin-container pull-left'>
            <div className='coin-icon margin-top-5' style={{ backgroundImage: `url(${config.siteUrl}/img/coins/coin_${a.from.symbol}.png)` }} />
            <div className='coin-info text-left'>
              <div className='text-white text-small'>{display.units(a.swap.unit, a.from.symbol, a.from.price)}</div>
              <div className='text-medium-grey text-small'>{a.from.name}</div>
            </div>
          </div>
        </div>
        <div className='col-md-4 padding-10'>
          <div className={`status margin-top-5 ${a.status.cl}`}>{a.status.text}</div>
          <div className='text-medium-grey text-small'>{a.status.details}</div>
        </div>
        <div className='col-md-4 padding-10'>
          <div className='coin-container pull-right'>
            <div className='coin-icon margin-top-5' style={{ backgroundImage: `url(${config.siteUrl}/img/coins/coin_${a.to.symbol}.png)` }} />
            <div className='coin-info text-right'>
              <div className='text-white text-small'>&nbsp;</div>
              <div className='text-medium-grey text-small'>{a.to.name}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  ))
  return (
    <ModalBody className='text-center'>
      <div className='modal-title'>order status</div>
      <div className='review-list padding-bottom-20'>
        {statusRow}
      </div>
      <div className='form-group'>
        <div className='cancel cursor-pointer' onClick={props.handleClose}>hide</div>
      </div>
    </ModalBody>
  )
}

export default SignTxModal
