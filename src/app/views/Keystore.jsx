import React from 'react'
import PropTypes from 'prop-types'
import Dropzone from 'react-dropzone'
import styles from 'Styles/Keystore.scss'

const Keystore = (props) => (
  <Dropzone className={styles.fileInput} multiple={false} onDrop={props.handleDrop}>
    <div className={styles.fileDesc}>Drop your keystore wallet file here</div>
  </Dropzone>
)

Keystore.propTypes = {
  handleDrop: PropTypes.func.isRequired
}

export default Keystore
