import React, { Fragment } from 'react'
import { compose, setDisplayName } from 'recompose'
import txFees from 'Img/txFees.png'
import Icon from 'Components/Icon'
import { withRouteData } from 'react-static'
import SwapIcon from 'Img/swap-icon.svg?inline'
import Header from 'Site/components/Header'
import EmailSubscriptionForm from 'Site/components/EmailSubscriptionForm'
import Footer from 'Site/components/Footer'

export default compose(
  setDisplayName('Pricing'),
  withRouteData
)(({ translations }) => (
  <Fragment>
    <Header translations={translations} />
    <div className='mb-4'>
      <div className='container text-center'>
        <div className='mb-4'>
          <h2 className='text-primary'>Pricing</h2>
          <div className='page-desc'>faa.st is the cheapest way to <b>instantly</b> exchange crypto currencies</div>
        </div>
        <div className='bg-ultra-dark py-4 px-2 my-3'>
          <div>
            <Icon 
              className='p-1 border border-primary'
              style={{ fill: '#05B8AB', height: '30px', width: '30px', borderRadius: '50%' }} 
              src={SwapIcon} 
            />
          </div>
          <div className='font-weight-bold'>optimized transactions</div>
          <div className='text-muted'>faa.st portfolio intelligently optimizes transactions. This allows diversification with the <b>minimum number</b> of transactions and fees.</div>
        </div>

        <div className='bg-ultra-dark py-4 px-2 my-3'>
          <div className='mb-3'>Here is an example transaction confirmation which clearly indicates transaction fees.</div>
          <div>
            <img
              className='mt-2 p-1' 
              style={{ minWidth: '320px', maxWidth: '600px', width: '100%', background: '#333' }} 
              src={txFees}
            />
          </div>
        </div>

        <div className='row'>
          <div className='col-md-4'>
            <div className='bg-ultra-dark py-5 px-4 mb-3'>
              <div className='font-weight-bold'>swap fee</div>
              <div className='text-muted'>A <b>0.5%</b> swap fee is applied on each side while swapping between two cryptocurrencies.</div>
            </div>
          </div>
          <div className='col-md-4'>
            <div className='bg-ultra-dark py-5 px-4 mb-3'>
              <div className='font-weight-bold'>exchange rate</div>
              <div className='text-muted'>Exchange rates are based on <b>real-time market data</b>. Large orders are priced based on market depth.</div>
            </div>
          </div>
          <div className='col-md-4'>
            <div className='bg-ultra-dark py-5 px-4 mb-3'>
              <div className='font-weight-bold'>network fees</div>
              <div className='text-muted'>Network fees are charged on deposits and withdrawals. These fees are <b>paid to miners, not faa.st.</b></div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <EmailSubscriptionForm />
    <Footer translations={translations} />
  </Fragment>
))