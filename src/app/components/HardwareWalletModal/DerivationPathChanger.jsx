import React, { Component } from 'react'
import { Form, Button } from 'reactstrap'
import { reduxForm } from 'redux-form'

import ReduxFormField from 'Components/ReduxFormField'

const validateDerivationPath = (path) => {
  if (!(typeof path === 'string'
        && /^[a-z](\/[0-9]+'?)+$/.test(path.trim()))) {
    return 'Invalid derivation path'
  }
}

const DerivationPathForm = reduxForm({
  form: 'derivationPathChanger'
})(({ handleSubmit }) => (
  <Form onSubmit={handleSubmit}>
    <ReduxFormField
      name='derivationPath'
      label='Derivation path'
      placeholder='Derivation path'
      type='text'
      bsSize='md'
      autoCorrect={false}
      autoCapitalize={false}
      spellCheck={false}
      validate={validateDerivationPath}
      addonAppend={({ invalid }) => (
        <Button color='primary' size='md' outline type='submit' disabled={invalid}>
          <i className='fa fa-level-down fa-rotate-90' />
        </Button>
      )}
    />
  </Form>
))

class DerivationPathChanger extends Component {
  constructor () {
    super()
    this.state = {
      showForm: false
    }
    this.toggleShowForm = this.toggleShowForm.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  toggleShowForm () {
    this.setState({ showForm: !this.state.showForm })
  }

  handleSubmit (values) {
    const { onChange, path } = this.props
    const { derivationPath: newPath } = values
    this.setState({ showForm: false })
    if (newPath !== path) {
      onChange(values.derivationPath)
    }
  }

  render () {
    const { path } = this.props
    const { showForm } = this.state
    const { toggleShowForm, handleSubmit } = this
    return showForm
      ? (<DerivationPathForm
          onSubmit={handleSubmit}
          initialValues={{ derivationPath: path }}/>)
      : (<Button color='link' className='mx-auto' onClick={toggleShowForm}>
          Change derivation path
        </Button>)
  }
}

export default DerivationPathChanger
