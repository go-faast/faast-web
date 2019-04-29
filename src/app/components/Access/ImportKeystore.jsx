import React from 'react'
import { connect } from 'react-redux'
import Dropzone from 'react-dropzone'

import { openKeystoreFileWallet } from 'Actions/access'

import CoinIcon from 'Components/CoinIcon'
import T from 'Components/i18n/T'

import AccessTile from './AccessTile'

const ImportKeystore = ({ openKeystoreFile }) => (
  <Dropzone className='p-0' multiple={false} onDrop={(f) => openKeystoreFile(f)}>
    <AccessTile className='border-dashed'>
      <T tag='h5' i18nKey='app.access.importKeystore.import' className='text-primary'>
        <i className='fa fa-sign-in mr-2'/>Import wallet
      </T>
      <T tag='h6' i18nKey='app.access.importKeystore.drag'>Drag and drop your keystore file</T>
      <CoinIcon symbol='ETH' size={3} className='m-2'/>
    </AccessTile>
  </Dropzone>
)

const mapDispatchToProps = {
  openKeystoreFile: openKeystoreFileWallet,
}

export default connect(null, mapDispatchToProps)(ImportKeystore)
