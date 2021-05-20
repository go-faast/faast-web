import React from 'react'

const InlineEmailForm = ({ height = '100%' }) => (
  <iframe 
    src='https://app.mailjet.com/widget/iframe/3lll/ij9' 
    width='100%'
    height={height}
    className='position-relative'
    style={{ zIndex: 9999, overflowX: 'hidden', overflowY: 'scroll' }}
    frameBorder='0' scrolling='no' marginHeight='0' marginWidth='0'>
  </iframe>
)

export default InlineEmailForm
