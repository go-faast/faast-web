import React from 'react'
import { connect } from 'react-redux'
import { compose, setDisplayName, withProps, withHandlers } from 'recompose'
import { createStructuredSelector } from 'reselect'
import {
  Card, CardHeader, CardBody, CardTitle, CardText, Button
} from 'reactstrap'

import toastr from 'Utilities/toastrWrapper'

import { getCurrentSwundleStatus } from 'Selectors'
import { forgetCurrentOrder } from 'Actions/swap'
import { toggleOrderModal } from 'Actions/redux'

import Spinner from 'Components/Spinner'
import SignTxModal from 'Components/SignTxModal'

const statusRenderData = {
  working: {
    title: (<span className='text-muted'>In Progress <Spinner inline size='sm'/></span>),
    description: 'Your order is still in progress. You cannot modify your portfolio until your order has been fulfilled.',
  },
  complete: {
    title: (<span className='text-success'>Complete <i className='fa fa-check-circle'/></span>),
    description: 'The order completed successfully. It may take a short amount of time to see the adjusted balances reflected in your portfolio.'
  },
  error: {
    title: (<span className='text-danger'>Error <i className='fa fa-exclamation-circle' /></span>),
    description: 'There was an issue with one or more swaps in your order. Click "Details" for more.'
  },
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
    status: getCurrentSwundleStatus,
    showModal: ({ orderModal: { show } }) => show,
  }), {
    forgetCurrentOrder,
    toggleModal: toggleOrderModal,
  }),
  withHandlers({
    handleForget: ({ forgetCurrentOrder }) => {
      toastr.confirm(null, {
        component: ForgetOrderPrompt,
        onOk: forgetCurrentOrder
      })
    },
  }),
  withProps(({ status }) => statusRenderData[status])
)(({ status, title, description, showModal, toggleModal, handleForget }) => (
  <Card>
    <CardHeader><CardTitle>Order Status</CardTitle></CardHeader>
    <CardBody>
      <div className='mb-2'><small>{title}</small></div>
      <CardText>{description}</CardText>
      <Button color='primary' outline size='sm' onClick={toggleModal}>Details</Button>
      {status === 'working' && (
        <Button color='link' size='sm' className='mx-3' onClick={handleForget}>Forget</Button>
      )}
    </CardBody>
    <SignTxModal showModal={showModal} toggleModal={toggleModal} view='orderStatus' />
  </Card>
))