import React from 'react'
import { compose, setDisplayName, } from 'recompose'
import classNames from 'class-names'

import style from './style.scss'

const EmailSub = ({ translations: { static: { email } = {} } = {} }) => {
  return (
    <div className={classNames(style.container, 'text-center mt-4')}>
      <p style={{ color: '#EFEFEF', fontSize: 18 }}>{email.cta}</p>
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