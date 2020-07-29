import React from 'react'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'

import AddressSearchForm from 'Components/AddressSearchForm'

const AddressSearch = ({ routerPush, ...props }) => (
  <AddressSearchForm
    onSubmit={({ address }) => address && routerPush(`/address/${address}`)}
    {...props}
  />
)

const mapDispatchToProps = {
  routerPush: push,
}

export default connect(null, mapDispatchToProps)(AddressSearch)