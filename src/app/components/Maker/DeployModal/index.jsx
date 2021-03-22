import React, { Fragment } from 'react'
import { compose, lifecycle, setDisplayName, setPropTypes, withHandlers, withProps, withState } from 'recompose'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import { Modal, ModalBody, ModalHeader, Row, Col, Input, Button } from 'reactstrap'
import { pick } from 'lodash'
import classNames from 'class-names'
import QRCode from 'Components/DepositQRCode'
import Units from 'Components/Units'
import config from 'Config'

import { getMakerDepositContractEstimateCost, deployMasterContract } from 'Actions/maker'
import { getMakerWalletBySymbol, getTotalBalanceBySymbol } from 'Selectors/maker'

import { modalShadow } from './style'
import { cardHeader, input } from '../style'

const getQuery = ({ match }) => ({
  symbol: match.params.symbol
})

export default compose(
  setDisplayName('DeployModal'),
  setPropTypes({
    ...Modal.propTypes,
  }),
  withProps((props) => {
    const { symbol } = getQuery(props)
    return ({
      symbol
    })
  }),
  connect(createStructuredSelector({
    balance: (state, { symbol }) => getTotalBalanceBySymbol(state, symbol),
    depositAddresss: (state, { symbol }) => getMakerWalletBySymbol(state, symbol)
  }), {
    getMakerDepositContractEstimateCost,
    deployMasterContract
  }),
  withState('estimateCost', 'updateEstimateCost', undefined),
  withState('deployTx', 'updateDeployTx', undefined),
  withState('isLoading', 'updateIsLoading', false),
  withHandlers({
    handleDeployContract: ({ deployMasterContract, symbol, updateDeployTx, updateIsLoading }) => async () => {
      updateIsLoading(true)
      const tx = await deployMasterContract(symbol)
      updateDeployTx(tx)
      updateIsLoading(false)
    }
  }),
  lifecycle({
    async componentDidMount() {
      const { getMakerDepositContractEstimateCost, symbol, updateEstimateCost, depositAddresss } = this.props
      if (depositAddresss) {
        const cost = await getMakerDepositContractEstimateCost(symbol)
        console.log(cost)
        updateEstimateCost(cost)
      }
    }
  })
)(({ depositAddress, symbol, estimateCost, balance, deployTx, isLoading, toggle, handleDeployContract, ...props }) => {
  const explorerURL = config.explorerUrls[symbol]
  const link = deployTx && `${explorerURL}/tx/${deployTx.txid}`
  return (
    <Modal
      size='md' toggle={toggle} className={'border-0 mt-6 mx-md-auto'} contentClassName={classNames(cardHeader, modalShadow, 'p-0 border-0 flat')}
      {...pick(props, Object.keys(Modal.propTypes))}>
      <ModalHeader close={<span className='cursor-pointer' onClick={toggle}>close</span>} tag='h4' toggle={toggle} className={cardHeader}>
        Deploy {symbol} Contract
      </ModalHeader>
      <ModalBody className={classNames(cardHeader, 'p-0 p-sm-3')}>
        <Row>
          {depositAddress && !deployTx ? (
            <Fragment>
              <Col sm='12'>
                <div>
                  <div className='text-center'>
                    <QRCode address={depositAddress} size={150} />
                  </div>
                  <Input className={classNames('flat text-center', input)} value={depositAddress} type='text' autoFocus readOnly/>
                  <div className='text-center'>
                    {estimateCost ? (
                      <small><p className='text-danger font-weight-bold pl-0 pt-3'>
                    * The estimated cost of deploying this contract is {estimateCost} {symbol} and your current balance is: <Units value={balance} symbol={symbol} precision={6} showSymbol showIcon iconProps={{ className: 'd-sm-none' }}/>
                      </p>
                      </small>
                    ) : (
                      <small>
                        <p className='text-danger font-weight-bold pl-0 pt-3'>
                        Your maker wallet must contain a minimum amount of {symbol} in order to deploy this contract. We are unable to retrieve that amount right now. Please try again later.
                        </p>
                      </small>
                    )}
                  </div>
                </div>
              </Col>
              <Col sm='12'>
                <Button 
                  disabled={isLoading || (parseFloat(estimateCost) < parseFloat(balance)) || !estimateCost} 
                  color='primary w-100 flat'
                  onClick={handleDeployContract}
                >
                    Deploy {symbol} Contract
                </Button>
              </Col>
            </Fragment>
          ) : deployTx ? (
            <Fragment>
              <Col className='text-center' xs='12'>
                <i style={{ fontSize: 42 }} className='fa fa-check-circle-o mb-4 text-primary' />
              </Col>
              <Col xs='12'>
              The {symbol} contract has successfully been deployed! You can track the transaction <a href={link} target='_blank noreferrer'>here.</a>
              </Col>
            </Fragment>
          ) : (
            <Col xs='12'>
              You must first complete the maker setup steps before you are able to deploy your {symbol} contract. Contact support@faa.st if you have any questions.
            </Col>
          )}
        </Row>
      </ModalBody>
    </Modal>
  )
})
