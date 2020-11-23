import React from 'react'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import { compose, lifecycle, setDisplayName, withHandlers, withState } from 'recompose'
import { Form, Button, Row, Col } from 'reactstrap'
import { reduxForm } from 'redux-form'
import ReduxFormField from 'Components/ReduxFormField'
import classNames from 'class-names'
import rug from 'random-username-generator'

import { input, text } from '../style'

import { register } from 'Actions/maker'

const MakerSignupForm = ({ handleSubmit, randomNames, generateRandomNames, updateMakerName }) => {
  return (
    <Form onSubmit={handleSubmit}>
      <ReduxFormField
        name='email'
        type='email'
        placeholder='Email Address'
        inputClass={classNames('flat', input)}
        label={<small><p className={classNames('mt-0 mb-0 font-weight-bold', text)}>Email Address</p></small>}
      />
      <ReduxFormField
        name='name'
        type='text'
        placeholder='Full Name'
        inputClass={classNames('flat', input)}
        label={<small><p className={classNames('mt-0 mb-0 font-weight-bold', text)}>Full Name</p></small>}
      />
      <ReduxFormField
        name='publicName'
        type='text'
        readonly
        placeholder='Public Maker Name'
        inputClass={classNames('flat', input)}
        label={<small><p className={classNames('mt-0 mb-0 font-weight-bold', text)}>Public Maker Name</p></small>}
      />
      {randomNames.length > 0 && (
        <Row>
          {randomNames.map(name => {
            return (
              <Col onClick={() => updateMakerName(name)} xs='3' key={name}>
                {name}
              </Col>
            )
          })}
          <div onClick={generateRandomNames}>
            Refresh
          </div>
        </Row>
      )}
      <ReduxFormField
        name='makerId'
        type='hidden'
        placeholder='Maker ID'
        inputClass={classNames('flat', input)}
        label={<small><p className={classNames('mt-0 mb-0 font-weight-bold', text)}>Maker ID</p></small>}
      />
      <ReduxFormField
        name='password'
        type='password'
        placeholder='Password'
        inputClass={classNames('flat', input)}
        label={<small><p className={classNames('mt-0 mb-0 font-weight-bold', text)}>Password</p></small>}
      />
      <ReduxFormField
        name='confirmPassword'
        type='confirmPassword'
        placeholder='Confirm Password'
        inputClass={classNames('flat', input)}
        label={<small><p className={classNames('mt-0 mb-0 font-weight-bold', text)}>Confirm Password</p></small>}
      />
      <Button className='w-100 flat' color='primary' type='submit'>Signup</Button>
    </Form>
  )
}

export default compose(
  setDisplayName('MakerSignupForm'),
  connect(createStructuredSelector({
  }), {
    register
  }),
  withState('randomNames', 'updateRandomNames', []),
  withHandlers({
    onSubmit: () => () => {
      // register
    },
    generateRandomNames: ({ updateRandomNames }) => () => {
      const names = []
      for (let i = 0; i < 3; i++) {
        names.push(rug.generate())
      }
      updateRandomNames(names)
    }
  }),
  lifecycle({
    componentDidMount() {
      const { generateRandomNames } = this.props
      generateRandomNames()
    }
  }),
  reduxForm({
    form: 'maker_signup',
    enableReinitialize: true,
    keepDirtyOnReinitialize: true,
    updateUnregisteredFields: true,
  }),
  withHandlers({
    updateMakerName: ({ change }) => (name) => {
      change('publicName', name)
    }
  })
)(MakerSignupForm)
