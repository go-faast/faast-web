import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'class-names'
import { Button } from 'reactstrap'


const StatusPending = ({ status }) => (
  <h5 className='blink'>{status.toUpperCase()}</h5>
)

const StatusWaiting = ({ seconds, handleManualRetry }) => (
  <div>
    Unable to connect, trying again in <b>{seconds}</b> seconds<br/>
    <Button size='sm' color='link' onClick={handleManualRetry}>
      Retry Now <i className='fa fa-repeat'/>
    </Button>
  </div>
)

const StatusSuccess = ({ status, confVersion }) => (
  <h5>
    {status.toUpperCase()}
    {confVersion && (<small className='text-muted'>&nbsp;&nbsp;(v. {confVersion})</small>)}
  </h5>
)

const StatusFailed = ({ status, handleManualRetry }) => (
  <div>
    <h5>{status.toUpperCase()}</h5>
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
    <div className={classNames(className, 'text-center', `text-${color}`)}>
      <i className={classNames('mb-2 fa fa-4x', icon)}/>
      {StatusComponent && <StatusComponent status={status} {...props}/>}
    </div>
  )
}

CommStatus.propTypes = {
  status: PropTypes.string.isRequired,
}

export default CommStatus
