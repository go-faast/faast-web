import React from 'react'
import PropTypes from 'prop-types'
import Dropzone from 'react-dropzone'
import classNames from 'class-names'
import styles from './style'
import { accessTile as accessTileStyle } from 'Components/AccessTile/style'

const KeystoreView = (props) => (
  <Dropzone className={classNames(accessTileStyle, 'p-3')} multiple={false} onDrop={props.handleDrop}>
    <div className={styles.dropzoneContent}>
      <h5 className='text-gradient' style={{ lineHeight: 1.5 }}>Drop your wallet keystore file here</h5>
    </div>
  </Dropzone>
)

KeystoreView.propTypes = {
  handleDrop: PropTypes.func.isRequired
}

export default KeystoreView
