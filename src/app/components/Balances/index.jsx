import React, { Fragment } from 'react'
import { createStructuredSelector } from 'reselect'
import PropTypes from 'prop-types'
import { Card, CardHeader, CardBody
} from 'reactstrap'
import { connect } from 'react-redux'

import { getWalletWithHoldings } from 'Selectors'
import Address from 'Components/Address'
import LoadingFullscreen from 'Components/LoadingFullscreen'
import PieChart from 'Components/PieChart'
import AssetTable from 'Components/AssetTable'

const Balances = ({ wallet }) => {
  const {
    address, assetHoldings, holdingsLoaded, holdingsError
  } = wallet

  const assetRows = assetHoldings.filter(({ shown }) => shown)

  return (
    <Fragment>
      {!holdingsLoaded && (
        <LoadingFullscreen label='Loading balances...' error={holdingsError}/>
      )}
      <Card>
        <CardHeader>
          <h5>Holdings</h5>
        </CardHeader>
        <AssetTable assetRows={assetRows}/>
      </Card>
      <Card className='mt-3'>
        <CardHeader>
          <h5>Distribution</h5>
        </CardHeader>
        <CardBody>
          {address && (
            <div className='text-right' style={{ lineHeight: 1 }}>
              <Address address={address} />
              <small className='text-muted'>address</small>
            </div>
          )}
          <PieChart portfolio={wallet} />
        </CardBody>
      </Card>
    </Fragment>
  )
}

Balances.propTypes = {
  wallet: PropTypes.object.isRequired
}

const ConnectedBalances = connect(createStructuredSelector({
  wallet: (state, { id }) => getWalletWithHoldings(state, id),
}))(Balances)

ConnectedBalances.propTypes = {
  id: PropTypes.string.isRequired,
}

Balances.Connected = ConnectedBalances

export { Balances, ConnectedBalances }
export default Balances
