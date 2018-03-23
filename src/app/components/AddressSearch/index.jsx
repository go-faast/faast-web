import React from 'react'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import { isValidAddress } from 'Utilities/wallet'
import toastr from 'Utilities/toastrWrapper'

import AddressSearchForm from './form'

class AddressSearch extends React.PureComponent {

  handleAddressSearch = (values) => {
    const address = typeof values.address === 'string' ? values.address.trim() : ''
    if (!isValidAddress(address)) {
      toastr.error('Not a valid address')
    } else {
      this.props.historyPush(`/address/${address}`)
    }
  }

  render = () => (
    <AddressSearchForm
      onSubmit={this.handleAddressSearch}
      {...this.props}
    />
  )
}

const mapDispatchToProps = {
  historyPush: push,
}

export default connect(null, mapDispatchToProps)(AddressSearch)