import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import AddressModal from 'Views/AddressModal'

const AddressModalController = (props) => (
  <AddressModal address={props.wallet.address} {...props} />
)

AddressModalController.propTypes = {
  wallet: PropTypes.object.isRequired
}

const mapStateToProps = (state) => ({
  wallet: state.wallet
})

export default connect(mapStateToProps)(AddressModalController)
