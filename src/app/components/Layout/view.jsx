import React from 'react'
import Header from 'Components/Header'

const LayoutView = (props) => {
  return (
    <div className='container padding-bottom-100 pt-3'>
      <Header {...props} />
      {props.children}
    </div>
  )
}

export default LayoutView
