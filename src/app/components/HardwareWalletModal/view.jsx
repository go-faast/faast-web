import React from 'react'
import { Row, Col, Modal, ModalBody, ModalHeader, ModalFooter, Card } from 'reactstrap'
import { Button } from 'reactstrap'
import classNames from 'class-names'

import Units from 'Components/Units'
import Spinner from 'Components/Spinner'
import AddressLink from 'Components/AddressLink'

import AccountSelect from './AccountSelect'

const StatusPending = ({ status }) => (
  <h5 className='blink'>{status.toUpperCase()}</h5>
)

const StatusWaiting = ({ seconds }) => (
  <div>
    Unable to connect, trying again in <b>{seconds}</b> seconds
  </div>
)

const StatusSuccess = ({ status, confVersion }) => (
  <h5>
    {status.toUpperCase()}
    {Boolean(confVersion) &&
      <small className='text-muted'>&nbsp;&nbsp;(v. {confVersion})</small>
    }
  </h5>
)

const StatusFailed = ({ status, handleManualRetry }) => (
  <div>
    <h5>
      {status.toUpperCase()}
    </h5>
    <Button size='sm' color='link' onClick={handleManualRetry}>
      Retry <i className='fa fa-repeat'/>
    </Button>
  </div>
)

const statusRenderData = {
  connecting: {
    color: 'primary',
    icon: 'fa-cog fa-spin',
    component: StatusPending,
  },
  connected: {
    color: 'success',
    icon: 'fa-check-circle-o',
    component: StatusSuccess,
  },
  waiting: {
    color: 'warning',
    icon: 'fa-exclamation-circle',
    component: StatusWaiting,
  },
  cancelled: {
    color: 'warning',
    icon: 'fa-exclamation-circle',
    component: StatusFailed,
  },
  error: {
    color: 'danger',
    icon: 'fa-exclamation-triangle',
    component: StatusFailed,
  },
}

const CommStatus = ({ status, className, ...props }) => {
  const renderData = statusRenderData[status]
  if (!renderData) {
    return null
  }
  const { color, icon, component: StatusComponent } = renderData
  return (
    <div className={classNames(className, 'text-center')}>
      <h6>STATUS</h6>
      <div className={`text-${color}`}>
        <i className={classNames('mb-2 fa fa-4x', icon)}/>
        {StatusComponent && <StatusComponent status={status} {...props}/>}
      </div>
    </div>
  )
}

const ConnectionInstructions = ({ instructions }) => (
  <Row className='gutter-2 text-muted'>
    {instructions.map(({ icon, text }, i) => (
      <Col key={i} xs='12' md={(i === instructions.length - 1) ? true : '6'}>
        <Card body className='h-100 flex-col-center flat'>
          <i className={classNames('mb-2 fa fa-2x', icon)} />
          <div>{text}</div>
        </Card>
      </Col>
    ))}
  </Row>
)

const ConfirmAccountSelection = ({ address, balance, index, toggleAccountSelect }) => (
  <div className='flex-col-center'>
    <Card body color='dark' className='text-left my-3'>
      <h5>Account #{index + 1}
        <span className='float-right text-muted'>
          {typeof balance !== 'undefined'
            ? (<Units value={balance} symbol='ETH'/>)
            : (<Spinner inline size='sm'/>)}
        </span>
      </h5>
      {address && (<AddressLink address={address} className='mt-2'/>)}
    </Card>
    <div className='mt-2 align-self-stretch'>
      <Row className='gutter-3 justify-content-center'>
        <Col xs='auto'>
          <Button color='primary' onClick={toggleAccountSelect}>Change account</Button>
        </Col>
      </Row>
    </div>
  </div>
)

const HardwareWalletModalView = ({
  name, instructions, isOpen, handleToggle, handleClose, commStatus,
  showAccountSelect, onConfirm, disableConfirm, toggleAccountSelect,
  commStatusProps, accountSelectProps, confirmAccountSelectionProps
}) => (
  <Modal size='lg' className='text-center' isOpen={isOpen} toggle={handleToggle}>
    <ModalHeader tag='h3' className='text-primary' cssModule={{ 'modal-title': 'modal-title mx-auto' }} toggle={handleToggle}>
      Adding {name}
    </ModalHeader>
    <ModalBody className='flex-col-center'>
      <div className='modal-text flex-col-center py-4'>
        <CommStatus className='mb-3' {...commStatusProps}/>
        {(commStatus !== 'connected'
          ? (<ConnectionInstructions instructions={instructions}/>)
          : (showAccountSelect
            ? (<AccountSelect {...accountSelectProps} />)
            : (<ConfirmAccountSelection {...confirmAccountSelectionProps}/>)))
        }
      </div>
    </ModalBody>
    <ModalFooter className='justify-content-between'>
      {showAccountSelect
        ? (<Button outline color='primary' onClick={toggleAccountSelect}>back</Button>)
        : (<Button outline color='primary' onClick={handleClose}>cancel</Button>)}
      {commStatus === 'connected' && !showAccountSelect && (
        <Button color='success' onClick={onConfirm} disabled={disableConfirm}>Confirm</Button>
      )}
    </ModalFooter>
  </Modal>
)

export default HardwareWalletModalView
