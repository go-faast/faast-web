import React, { Fragment } from 'react'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import { compose, lifecycle, setDisplayName, withHandlers, withState } from 'recompose'
import { Form, Button, Row, Col } from 'reactstrap'
import { reduxForm, formValueSelector } from 'redux-form'
import ReduxFormField from 'Components/ReduxFormField'
import classNames from 'class-names'
import rug from 'random-username-generator'
import * as validator from 'Utilities/validator'

const FORM_NAME = 'maker_signup'

const getFormValue = formValueSelector(FORM_NAME)

import { input, text } from '../style'

import { register } from 'Actions/maker'

const MakerSignupForm = ({ handleSubmit, randomNames, generateRandomNames, updateMakerName,
  validateRequired, confirmPassword, publicName }) => {
  return (
    <Form onSubmit={handleSubmit}>
      <ReduxFormField
        name='email'
        type='email'
        placeholder='Email Address'
        validate={validateRequired}
        inputClass={classNames('flat', input)}
        label={<small><p className={classNames('mt-0 mb-0 font-weight-bold', text)}>Email Address</p></small>}
      />
      <ReduxFormField
        name='name'
        type='text'
        validate={validateRequired}
        placeholder='Full Name'
        inputClass={classNames('flat', input)}
        label={<small><p className={classNames('mt-0 mb-0 font-weight-bold', text)}>Full Name</p></small>}
      />
      <ReduxFormField
        name='publicName'
        type='hidden'
        className='mb-0'
        validate={validateRequired}
        readonly
        placeholder='Public Maker Name'
        inputClass={classNames('flat mb-0', input)}
        label={<small><p className={classNames('mt-0 mb-0 pb-0 font-weight-bold', text)}>Public Maker Name</p></small>}
      />
      {randomNames.length > 0 && (
        <Fragment>
          <small className={text}>Choose a maker name from the auto-generated options below.</small>
          <Row className='mx-1 mt-2'>
            {randomNames.map((name, i) => {
              const selected = publicName == name
              return (
                <Col 
                  className={classNames('p-2 text-center cursor-pointer mb-1', i < randomNames.length - 1 && 'mr-1')}
                  style={{ border: selected ? '1px solid #00D7B8' : '1px solid #ccc', borderRadius: 2, color: selected ? '#00D7B8' : '#525252' }}
                  onClick={() => updateMakerName(name)} 
                  xs='4'
                  key={name}
                >
                  <small>{name}</small>
                </Col>
              )
            })}
          </Row>
          <Button size='sm' color='primary' className={classNames('d-block flat ml-1 mt-2', text)} onClick={generateRandomNames}>
            <i className='fa fa-refresh' /> Refresh Options
          </Button>
        </Fragment>
      )}
      <ReduxFormField
        name='makerId'
        type='hidden'
        placeholder='Maker ID'
        inputClass={classNames('flat', input)}
      />
      <ReduxFormField
        name='password'
        type='password'
        validate={validateRequired}
        placeholder='Password'
        inputClass={classNames('flat', input)}
        label={<small><p className={classNames('mt-0 mb-0 font-weight-bold', text)}>Password</p></small>}
      />
      <ReduxFormField
        name='confirmPassword'
        type='confirmPassword'
        placeholder='Confirm Password'
        validate={confirmPassword}
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
    password: (state) => getFormValue(state, 'password'),
    publicName: (state) => getFormValue(state, 'publicName'),
  }), {
    register
  }),
  withState('randomNames', 'updateRandomNames', []),
  reduxForm({
    form: FORM_NAME,
    enableReinitialize: true,
    keepDirtyOnReinitialize: true,
    updateUnregisteredFields: true,
  }),
  withHandlers({
    updateMakerName: ({ change }) => (name) => {
      change('publicName', name)
    },
    validateEmail: () => validator.all(
      validator.required(),
    ),
    validateRequired: () => validator.all(
      validator.required(),
    ),
    confirmPassword: ({ password }) => validator.all(
      validator.required(),
      validator.needsToEqual(password, 'The passwords do not match.')
    )
  }),
  withHandlers({
    onSubmit: () => () => {
      // register
    },
    generateRandomNames: ({ updateRandomNames, updateMakerName }) => () => {
      const names = []
      updateMakerName(undefined)
      rug.setSeperator(' ')
      for (let i = 0; i < 4; i++) {
        names.push(rug.generate())
      }
      updateRandomNames(names)
    }
  }),
  lifecycle({
    componentDidMount() {
      const { generateRandomNames } = this.props
      generateRandomNames()
    },
    componentDidUpdate(prevProps) {
      const { publicName, change } = this.props
      if (publicName !== prevProps.publicName) {
        change('makerId', publicName.replace(/\s/g,''))
      }
    }
  }),
)(MakerSignupForm)
