import React from 'react'
import { connect } from 'react-redux'

import { openViewOnlyWallet } from 'Actions/access'

import AddressSearchForm from 'Components/AddressSearchForm'

const AddressSearch = ({ openWallet, ...props }) => (
  <AddressSearchForm
    onSubmit={({ address }) => openWallet(address)}
    {...props}
  />
)

const mapDispatchToProps = {
  openWallet: openViewOnlyWallet,
}

export default connect(null, mapDispatchToProps)(AddressSearch)