import React, { Component } from 'react'
import { Button } from 'reactstrap'
import DerivationPathForm from './form'

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
    this.setState({ showForm: false })
    this.props.onChange(values.derivationPath)
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