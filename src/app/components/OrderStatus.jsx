import React from 'react'
import { connect } from 'react-redux'
import { compose, setDisplayName, withProps, withHandlers } from 'recompose'
import { createStructuredSelector } from 'reselect'
import {
  Card, CardHeader, CardBody, CardTitle, CardText, Button
} from 'reactstrap'

import toastr from 'Utilities/toastrWrapper'

import { getLatestSwundle } from 'Selectors'
import { dismissLatestSwundle } from 'Actions/swundle'

import withToggle from 'Hoc/withToggle'
import Spinner from 'Components/Spinner'
import OrderStatusModal from 'Components/OrderStatusModal'

const statusRenderData = {
  pending: {
    title: (<span className='text-muted'>Processing <Spinner inline size='sm'/></span>),
    description: 'Your order is being processed.',
  },
  failed: {
    title: (<span className='text-warning'>Failed <i className='fa fa-exclamation-circle' /></span>),
    description: 'There was an issue with one or more swaps in your order. Click "Details" for more.'
  },
  complete: {
    title: (<span className='text-success'>Complete <i className='fa fa-check-circle'/></span>),
    description: 'The order completed successfully. It may take a short amount of time to see the adjusted balances reflected in your portfolio.'
  },
}

const forgetButtonText = 'Dismiss'

const ForgetOrderPrompt = () => (
  <div className='p-3'>
    Please be aware that <strong>{forgetButtonText}</strong> does not cancel an order,
    it justs stops the browser app from tracking the status of the order.
    The order may still process normally.
    Please only proceed if you have been instructed to do so, or you understand the effects.
  </div>
)

export default compose(
  setDisplayName('OrderStatus'),
  connect(createStructuredSelector({
    swundle: getLatestSwundle,
  }), {
    dismissLatestSwundle,
  }),
  withToggle('modalOpen'),
  withHandlers({
    handleForget: ({ swundle, dismissLatestSwundle }) => () => {
      if (swundle.status === 'pending') {
        toastr.confirm(null, {
          component: ForgetOrderPrompt,
          onOk: dismissLatestSwundle
        })
      } else {
        dismissLatestSwundle()
      }
    },
  }),
  withProps(({ swundle }) => statusRenderData[swundle.status])
)(({ swundle, title, description, isModalOpen, toggleModalOpen, handleForget }) => (
  <Card>
    <CardHeader><CardTitle>Order Status</CardTitle></CardHeader>
    <CardBody>
      <div className='mb-2'>{title}</div>
      <CardText>{description}</CardText>
      <Button color='primary' outline size='sm' onClick={toggleModalOpen}>Details</Button>
      <Button color='link' size='sm' className='mx-3' onClick={handleForget}>{forgetButtonText}</Button>
    </CardBody>
    <OrderStatusModal isOpen={isModalOpen} toggle={toggleModalOpen} swundle={swundle}/>
  </Card>
))
