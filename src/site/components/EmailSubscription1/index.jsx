import React from 'react'
import { compose, setDisplayName, } from 'recompose'

const EmailSub = ({ translations: { static: { email: t } } }) => {
  return (
    <div className='text-center mt-4'>
      <p style={{ color: '#EFEFEF', fontSize: 18 }}>{t.cta}</p>
      <section className='container-fluid signup-wrapper'>
        <iframe 
          className='position-relative'
          style={{ zIndex: 9999, width: '100%', maxWidth: 500 }}
          frameBorder='0' 
          scrolling='no' 
          marginHeight='0' 
          marginWidth='0' 
          src='https://app.mailjet.com/widget/iframe/3lll/iI7'
        >
        </iframe>
      </section>
    </div>
  )
}

export default compose(
  setDisplayName('EmailSub'),
)((EmailSub))