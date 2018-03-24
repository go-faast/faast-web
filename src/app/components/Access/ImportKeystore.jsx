import React from 'react'
import { connect } from 'react-redux'
import Dropzone from 'react-dropzone'

import { openKeystoreFileWallet } from 'Actions/access'

import CoinIcon from 'Components/CoinIcon'

import AccessTile from './AccessTile'

const ImportKeystore = ({ handleDrop }) => (
  <Dropzone className='p-0' multiple={false} onDrop={handleDrop}>
    <AccessTile className='border-dashed'>
      <h5 className='text-primary'><i className='fa fa-sign-in mr-2'/>Import wallet</h5>
      <h6>Drag and drop your keystore file</h6>
      <CoinIcon symbol='ETH' size={3} className='m-2'/>
    </AccessTile>
  </Dropzone>
)

const mapDispatchToProps = {
  handleDrop: openKeystoreFileWallet,
}

export default connect(null, mapDispatchToProps)(ImportKeystore)
