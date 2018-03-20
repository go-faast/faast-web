import React from 'react'
import PropTypes from 'prop-types'
import Dropzone from 'react-dropzone'
import AccessTile from 'Components/AccessTile'

const KeystoreView = (props) => (
  <Dropzone className='p-0' multiple={false} onDrop={props.handleDrop}>
    <AccessTile outline color='primary' className='border-dashed'>
      <h5 className='font-weight-light' style={{ lineHeight: 1.5 }}>Drop your wallet keystore file here</h5>
    </AccessTile>
  </Dropzone>
)

KeystoreView.propTypes = {
  handleDrop: PropTypes.func.isRequired
}

export default KeystoreView
