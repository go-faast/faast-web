import React from 'react'
import PropTypes from 'prop-types'
import Dropzone from 'react-dropzone'
import styles from './style'

const KeystoreView = (props) => (
  <Dropzone className={styles.fileInput} multiple={false} onDrop={props.handleDrop}>
    <div className={styles.fileDesc}>Drop your keystore wallet file here</div>
  </Dropzone>
)

KeystoreView.propTypes = {
  handleDrop: PropTypes.func.isRequired
}

export default KeystoreView
