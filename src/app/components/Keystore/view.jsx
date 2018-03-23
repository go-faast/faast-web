import React from 'react'
import PropTypes from 'prop-types'
import Dropzone from 'react-dropzone'
import AccessTile from 'Components/AccessTile'
import CoinIcon from 'Components/CoinIcon'

const KeystoreView = (props) => (
  <Dropzone className='p-0' multiple={false} onDrop={props.handleDrop}>
    <AccessTile className='border-dashed'>
      <h5 className='text-primary'><i className='fa fa-sign-in mr-2'/>Import wallet</h5>
      <h6>Drag and drop your keystore file</h6>
      <CoinIcon symbol='ETH' size={3} className='m-2'/>
    </AccessTile>
  </Dropzone>
)

KeystoreView.propTypes = {
  handleDrop: PropTypes.func.isRequired
}

export default KeystoreView
