import React, { Fragment } from 'react'
import { createStructuredSelector } from 'reselect'
import PropTypes from 'prop-types'
import {
  Card, CardHeader,
} from 'reactstrap'
import { connect } from 'react-redux'

import { getWalletWithHoldings } from 'Selectors'

import withToggle from 'Hoc/withToggle'

import LoadingFullscreen from 'Components/LoadingFullscreen'
import AssetTable from 'Components/AssetTable'

const Balances = ({ wallet, header }) => {
  const {
    assetHoldings, holdingsLoaded, holdingsError,
  } = wallet

  const assetRows = assetHoldings.filter(({ shown }) => shown)

  return (
    <Fragment>
      {!holdingsLoaded && (
        <LoadingFullscreen label='Loading balances...' error={holdingsError}/>
      )}
      <Card>
        <CardHeader>
          <h5>{header}</h5>
        </CardHeader>
        <AssetTable assetRows={assetRows}/>
      </Card>
    </Fragment>
  )
}

Balances.propTypes = {
  wallet: PropTypes.object.isRequired,
  handleRemove: PropTypes.func,
  handleAdd: PropTypes.func,
  isAlreadyInPortfolio: PropTypes.bool,
  showStats: PropTypes.bool,
  header: PropTypes.string,
}

Balances.defaultProps = {
  isAlreadyInPortfolio: true,
  showStats: false,
  header: 'Holdings',
}

const ConnectedBalances = connect(createStructuredSelector({
  wallet: (state, { id }) => getWalletWithHoldings(state, id),
}))(Balances)

ConnectedBalances.propTypes = {
  id: PropTypes.string.isRequired,
}

Balances.Connected = ConnectedBalances


export { Balances, ConnectedBalances }
export default withToggle('dropdownOpen')(Balances)
