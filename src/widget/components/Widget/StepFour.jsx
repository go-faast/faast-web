/* eslint-disable react/no-unescaped-entities */
import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { compose, setDisplayName, withProps, setPropTypes, withHandlers } from 'recompose'
import classNames from 'class-names'
import { Card, CardHeader, CardBody, Button } from 'reactstrap'
import { getSwap } from 'Common/selectors/swap'
import SwapStatusCard from 'Components/SwapStatusCard'
import { restoreSwapWidget } from 'Actions/widget'

import { withTranslation } from 'react-i18next'
import ProgressBar from '../ProgressBar'
import FaastLogo from 'Img/faast-logo.png'

import style from './style.scss'

const StepFour = ({ swap, handleStartNewSwap, swap: { receiveSymbol } }) => {
  return (
    <Fragment>
      <Card className={classNames('justify-content-center p-0 m-0', style.container, style.stepOne)}>
        <CardHeader style={{ backgroundColor: '#394045' }} className='pl-4 border-0'>
          <h4 className='my-1'><img src={FaastLogo} className='mr-2 text-left' width="30" height="30" /> Faa.st</h4>
        </CardHeader>
        <ProgressBar 
          text={`Receive ${receiveSymbol}`}
          currentStep={4}
        />
        <CardBody className='pt-3'>
          <div className='mt-3 text-left'>
            <SwapStatusCard swap={swap} expanded light/>
          </div>
          <Button 
            color='primary'
            onClick={handleStartNewSwap}
            className={classNames('mt-2 mb-0 mx-auto', style.customButton)} 
          >
            Start new swap
          </Button>
          <div className='text-center mt-3'>
            <a href={`https://faa.st/app/orders/${swap.orderId}`} target='_blank noreferrer'>View your order on Faa.st</a>
          </div>
        </CardBody>
        <div style={{ color: '#B5BCC4' }} className='text-center font-xs mb-3'>
          <span>powered by <a href='https://faa.st' target='_blank noreferrer'>Faa.st</a></span>
        </div>
      </Card>
    </Fragment>
  )}

export default compose(
  setDisplayName('StepFour'),
  withTranslation(),
  setPropTypes({
    swap: PropTypes.object.isRequired,
  }),
  connect((state, { swap: { id } }) => ({
    currentSwap: getSwap(state, id),
  }), {
    restoreSwapWidget
  }),
  withProps(({ swap, currentSwap }) => {
    return ({
      swap: currentSwap ? currentSwap : swap,
    })
  }),
  withHandlers({
    handleStartNewSwap: ({ restoreSwapWidget }) => () => {
      restoreSwapWidget({ swapInputs: undefined })
    }
  })
)(StepFour)
