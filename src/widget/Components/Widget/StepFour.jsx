/* eslint-disable react/no-unescaped-entities */
import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { compose, setDisplayName, withProps, setPropTypes } from 'recompose'
import classNames from 'class-names'
import { Card, CardHeader, CardBody } from 'reactstrap'
import { getSwap } from 'Common/selectors/swap'
import SwapStatusCard from 'Components/SwapStatusCard'
import { refreshSwap } from 'Actions/swap'

import T from 'Components/i18n/T'
import { withTranslation } from 'react-i18next'
import ProgressBar from '../ProgressBar'

import style from './style.scss'

const StepFour = ({ swap, swap: { receiveSymbol, sendSymbol } }) => {
  return (
    <Fragment>
      <Card className={classNames('justify-content-center p-0', style.container, style.stepOne)}>
        <CardHeader style={{ backgroundColor: '#394045' }} className='text-center border-0'>
          <T tag='h4' i18nKey='app.widget.swapInstantly' className='my-1'>Swap Instantly</T>
        </CardHeader>
        <CardBody className='pt-3'>
          <ProgressBar 
            steps={[
              { 
                text: 'Choose Assets',
              },
              {
                text: 'Input Addresses'
              },
              {
                text: `Send ${sendSymbol}`
              },
              {
                text: `Receive ${receiveSymbol}`
              }
            ]} 
            currentStep={3}
          />
          <div className='mt-3 text-left'>
            <SwapStatusCard swap={swap} expanded light/>
          </div>
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
    refreshSwap,
  }),
  withProps(({ swap, currentSwap }) => {
    return ({
      swap: currentSwap ? currentSwap : swap,
    })
  }),
)(StepFour)
