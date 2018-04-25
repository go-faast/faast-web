import React from 'react'
import { compose, setDisplayName } from 'recompose'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import { Button } from 'reactstrap'
import classNames from 'class-names'

import { getStatus, getRetryTimerSeconds, getConnectingAsset } from 'Selectors/connectHardwareWallet'
import { retryConnect } from 'Actions/connectHardwareWallet'

import CoinIcon from 'Components/CoinIcon'

const StatusPending = ({ status, icon }) => (
  <h5>
    <i className={classNames('mb-2 fa fa fa-lg', icon)}/> <span className='blink'>{status.toUpperCase()}</span>
  </h5>
)

const StatusWaiting = ({ retrySeconds, icon, handleRetry }) => (
  <div>
    <i className={classNames('fa fa-lg', icon)}/> Unable to connect, trying again in <b>{retrySeconds}</b> seconds<br/>
    <Button size='sm' color='link' onClick={handleRetry}>
      Retry Now <i className='fa fa-repeat'/>
    </Button>
  </div>
)

const StatusSuccess = ({ status, icon }) => (
  <h5>
    <i className={classNames('fa fa-lg', icon)}/> {status.toUpperCase()}
  </h5>
)

const StatusFailed = ({ status, icon, handleRetry }) => (
  <div>
    <h5><i className={classNames('fa fa-lg', icon)}/> {status.toUpperCase()}</h5>
    <Button size='sm' color='link' onClick={handleRetry}>
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

export default compose(
  setDisplayName('ConnectionStatus'),
  connect(createStructuredSelector({
    status: getStatus,
    retrySeconds: getRetryTimerSeconds,
    asset: getConnectingAsset,
  }), {
    handleRetry: retryConnect,
  })
)(({ status, asset, className, ...props }) => {
  const renderData = statusRenderData[status]
  if (!renderData) {
    return null
  }
  const { color, icon, component: StatusComponent } = renderData
  return (
    <div className={classNames(className, 'mb-4 text-center')}>
      {asset && (
        <div>
          <CoinIcon symbol={asset.symbol} size='lg' inline className='mb-3'/>
          <h5>{asset.name}</h5>
        </div>
      )}
      <div className={`my-3 text-${color}`}>
        {StatusComponent && <StatusComponent status={status} icon={icon} {...props}/>}
      </div>
    </div>
  )
})
