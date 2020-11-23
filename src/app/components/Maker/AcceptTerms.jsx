/* eslint-disable react/no-unescaped-entities */
import React from 'react'
import { compose, setDisplayName, withState, withHandlers } from 'recompose'
import { createStructuredSelector } from 'reselect'
import { connect } from 'react-redux'
import { Form, Input, FormGroup, Label, Button } from 'reactstrap'
import MakerLayout from 'Components/Maker/Layout'
import TermsText from 'Components/Maker/TermsText'
import { acceptTerms } from 'Actions/maker'

export default compose(
  setDisplayName('AcceptTerms'),
  connect(createStructuredSelector({
  }), {
    acceptTerms
  }),
  withState('checked', 'updateChecked', false),
  withHandlers({
    handleAcceptTerms: ({ acceptTerms }) => () => {
      acceptTerms()
    }
  })
)(({ checked, updateChecked, handleAcceptTerms }) => (
  <MakerLayout clickableHeaderLink={false} className='pt-5'>
    <div style={{ width: '100%', maxWidth: 600 }} className='container text-center'>
      <h2 className='text-left text-dark'>Terms and Conditions</h2>
      <div className='text-dark mx-auto p-3 font-xs text-left' style={{ width: '100%', height: '100%', maxHeight: 350, overflowY: 'scroll', backgroundColor: '#fff' }}>
        <TermsText />
      </div>
      <div className='mt-3 mb-4'>
        <Form>
          <FormGroup check>
            <Label className='text-dark' check>
              <Input value={checked} onChange={() => updateChecked(!checked)} type="checkbox" />{' '}
              I have read and agree to the Faa.st Market Maker Terms & Conditions
            </Label>
          </FormGroup>
        </Form>
      </div>
      <Button onClick={handleAcceptTerms} disabled={!checked} color='primary'>
        Continue to Dashboard
      </Button>
    </div>
  </MakerLayout>
))