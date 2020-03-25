/* eslint-disable react/no-unescaped-entities */
import React from 'react'
import { compose, setDisplayName, withState } from 'recompose'
import { createStructuredSelector } from 'reselect'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import { Form, Input, FormGroup, Label, Button } from 'reactstrap'
import AffiliateLayout from 'Components/Affiliate/Layout'

export default compose(
  setDisplayName('AcceptTerms'),
  connect(createStructuredSelector({
  }), {
    push: push,
  }),
  withState('checked', 'updateChecked', false),
)(({ checked, updateChecked, push }) => (
  <AffiliateLayout className='pt-5'>
    <div style={{ width: '100%', maxWidth: 600 }} className='container text-center'>
      <h2 className='text-left text-dark'>Terms and Conditions</h2>
      <div className='text-dark mx-auto p-3 font-xs text-left' style={{ width: '100%', height: '100%', maxHeight: 350, overflowY: 'scroll', backgroundColor: '#fff' }}>
        <div>
          <h5 className='font-weight-bold'>About</h5>
          <p>
            Faast allows API integrators to quickly and easily earn revenue by setting a specific percentage of each swap they would like to earn as a commission.  Unlike many alternative APIs, the Faast affiliate program allows the developer to choose the margin they would like to earn. The affiliate margin is the percentage (we allow from 0.0%  to 5.0%) that you would like to charge your customers for using the Faast SWAP API. We price swaps based on the prevailing rates on the market, plus an approximate 0.5% fee. Your margin as an affiliate is applied in addition to our fee.
          </p>
          <p>
            We suggest that all affiliates make clear to their users the affiliate margin being applied to a swap. The recommended margin is 0.5%, but you are welcome to vary this rate based on business opportunities and application. 
          </p>
          <p>
            All affiliates are subject to the <a href='https://faa.st/terms' target='_blank noopener noreferrer'>Faast terms and conditions</a>, and should not make any attempts to allow end consumers of the API to circumvent or otherwise bypass these terms and conditions.
          </p>
        </div>
        <div>
          <h5 className='font-weight-bold'>How Pricing Works</h5>
          <p>
            Faast offers both Fixed and Variable pricing options to affiliate users.
          </p>
          <p>
            Fixed pricing works as follows: Whenever you swap cryptocurrencies, there will always be a time lag in-between the time that the swap is initiated, and when a deposit with the crypto asset you want is sent for that specific swap. Given the volatility of cryptocurrency markets, even these short delays can cause pricing discrepancies, and as a result, a poor user experience.
          </p>
          <p>
            For this reason, Faast provides a “fixed pricing” option when creating a swap. Faast will guarantee the price quoted, assuming the deposit is received before the expiry period. To provide the best experience with fixed pricing, timing is paramount.
          </p>
          <p>
            Variable pricing: Variable pricing allows for more flexibility, in that users can deposit any amount and receive an equivalent payout based on the prevailing rate at the time the deposit is received. Given that the API does not know the exact deposit amount, it is impossible to accurately estimate the price of the swap beforehand (due to market depth issues on most cryptocurrencies). For this reason, the specific price of the swap will be quoted when a deposit is received by one of the blockchain nodes on the Faast network. To create a variable price swap, simply omit the deposit_amount when calling the /swap endpoint.
          </p>
        </div>
        <div>
          <h5 className='font-weight-bold'>Affiliate Payouts</h5>
          <p>
            All earned commission is accumulated in Bitcoin (BTC) to a developer's affiliate account. Affiliate payouts can be triggered via <a href='https://api.faa.st/#affiliate-withdraw-post' target='_blank noopener noreferrer'>API</a> or by using the affiliate web portal. Faast reserves the right to payout abandoned funds to the affiliate Bitcoin address on file if payouts are not regularly requested.
          </p>
        </div>
        <div>
          <h5 className='font-weight-bold'>Affiliate Registration</h5>
          <p>
            Affiliate registration can be completed by registering via <a href='https://api.faa.st/#affiliate-register-post' target='_blank noopener noreferrer'>API</a> or via the web-form <a href='https://faa.st/app/affiliates/signup'>here</a>. An API secret key will be generated. This key is required to claim affiliate payouts, and therefore should be kept secure and never revealed publicly.
          </p>
          <p>
            By participating in the Faast Affiliate Program, you consent that you have read, understood and agree to the above terms, as well as <a href='https://api.faa.st/#affiliate-program'>all information and conditions outlined in the Faast SWAP API product information page</a>.
          </p>
        </div>
      </div>
      <div className='mt-3 mb-4'>
        <Form>
          <FormGroup check>
            <Label className='text-dark' check>
              <Input value={checked} onChange={() => updateChecked(!checked)} type="checkbox" />{' '}
              I have read and agree to the Faa.st Affiliate Terms & Conditions
            </Label>
          </FormGroup>
        </Form>
      </div>
      <Button onClick={() => push('/affiliates/dashboard')} disabled={!checked} color='primary'>
        Continue to Dashboard
      </Button>
    </div>
  </AffiliateLayout>
))