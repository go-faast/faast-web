import React from 'react'
import PropTypes from 'prop-types'
import { Field } from 'redux-form'
import TextInputController from 'Controllers/TextInputController'
import styles from 'Styles/DerivationPathForm.scss'

const DerivationPathForm = (props) => {
  return (
    <form onSubmit={props.handleSubmit} className='form-inline'>
      <div className='form-group margin-auto'>
        <div className='input-group'>
          <Field
            name='derivationPath'
            component={TextInputController}
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

DerivationPathForm.propTypes = {
  handleSubmit: PropTypes.func.isRequired
}

export default DerivationPathForm
