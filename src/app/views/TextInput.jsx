import React from 'react'

const TextInput = (props) => {
  return (
    <input className='form-control' type='text' {...props.input} />
  )
}

export default TextInput
