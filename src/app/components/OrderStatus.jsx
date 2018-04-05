import React from 'react'
import { connect } from 'react-redux'
import { compose, setDisplayName, withHandlers } from 'recompose'
import { createStructuredSelector } from 'reselect'
import {
  Card, CardHeader, CardBody, CardTitle, CardText, Button
} from 'reactstrap'

import toastr from 'Utilities/toastrWrapper'

import { forgetCurrentOrder } from 'Actions/swap'
import { toggleOrderModal } from 'Actions/redux'

import Spinner from 'Components/Spinner'

const getTitle = (status) => {
  switch (status) {
    case 'working':
      return (<span className='text-muted'>In Progress <Spinner inline size='sm'/></span>)
    case 'complete':
      return (<span className='text-success'>Complete <i className='fa fa-check-circle'/></span>)
    case 'error':
      return (<span className='text-danger'>Error <i className='fa fa-exclamation-circle' /></span>)
  }
}
const getDescription = (status) => {
  switch (status) {
    case 'working':
      return 'Your order is still in progress. You cannot modify your portfolio until your order has been fulfilled.'
    case 'complete':
      return 'The order completed successfully. It may take a short amount of time to see the adjusted balances reflected in your portfolio.'
    case 'error':
      return 'There was an issue with one or more swaps in your order. Click "Details" for more.'
  }
}

const ForgetOrderPrompt = () => (
  <div>
    Please be aware that <strong>forget</strong> does not actually cancel an order,
    it justs stops the browser app from tracking the status of the order.
    The order may still process normally.
    Please only proceed if you have been instructed to do so, or you understand the effects.
  </div>
)

export default compose(
  setDisplayName('OrderStatus'),
  connect(createStructuredSelector({
    forgetCurrentOrder,
    toggleOrderModal,
  })),
  withHandlers({
    handleForgetOrder: ({ forgetCurrentOrder }) => {
      toastr.confirm(null, {
        component: ForgetOrderPrompt,
        onOk: forgetCurrentOrder
      })
    },
  })
)(({ status, toggleOrderModal, handleForgetOrder }) => (
  <Card>
    <CardHeader><CardTitle>Order Status</CardTitle></CardHeader>
    <CardBody>
      <div className='mb-2'><small>{getTitle(status)}</small></div>
      <CardText>{getDescription(status)}</CardText>
      <Button color='primary' outline size='sm' onClick={toggleOrderModal}>Details</Button>
      {status === 'working' && (
        <Button color='link' size='sm' className='mx-3' onClick={handleForgetOrder}>Forget</Button>
      )}
    </CardBody>
  </Card>
))