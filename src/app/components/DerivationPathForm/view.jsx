import React from 'react'
import PropTypes from 'prop-types'
import { Field } from 'redux-form'
import TextInput from 'Components/TextInput'
import styles from './style'

const DerivationPathFormView = (props) => {
  return (
    <form onSubmit={props.handleSubmit} className='form-inline'>
      <div className='form-group margin-auto'>
        <div className='input-group'>
          <Field
            name='derivationPath'
            component={TextInput}
          />
          <div className={`input-group-btn ${styles.inputBtn}`}>
            <button className={`btn btn-sm ${styles.submitButton}`} type='submit'>
              <i className='fa fa-level-down fa-rotate-90' />
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}

DerivationPathFormView.propTypes = {
  handleSubmit: PropTypes.func.isRequired
}

export default DerivationPathFormView
