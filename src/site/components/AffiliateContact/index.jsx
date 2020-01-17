import React from 'react'
import { compose, setDisplayName, } from 'recompose'

const AffiliateContact = () => {
  return (
    <div className='mt-0'>
      <section className='container-fluid signup-wrapper'>
        <iframe 
          className='mj-w-res-iframe'
          frameBorder='0'
          scrolling='no' 
          marginHeight='0'
          marginWidth='0' 
          src='https://app.mailjet.com/widget/iframe/3lll/ktS' 
          width='100%'
          height='400'
        >
        </iframe>
      </section>
    </div>
  )
}

export default compose(
  setDisplayName('AffiliateContact'),
)((AffiliateContact))