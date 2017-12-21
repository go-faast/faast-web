import React from 'react'

const TextInputView = (props) => {
  return (
    <input className='form-control' type='text' {...props.input} />
  )
}

export default TextInputView
