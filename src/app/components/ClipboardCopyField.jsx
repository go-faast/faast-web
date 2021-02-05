import React from 'react'
import { compose, setDisplayName, setPropTypes, withHandlers } from 'recompose'
import { Input, Button, Row, Col } from 'reactstrap'

import toastr from 'Utilities/toastrWrapper'

export default compose(
  setDisplayName('ClipboardCopyField'),
  setPropTypes({
    ...Input.propTypes,
  }),
  withHandlers(() => {
    let inputRef
    return {
      handleRef: () => (ref) => {
        inputRef = ref
      },
      handleFocus: () => (event) => {
        event.target.select()
      },
      handleCopy: ({ successText }) => () => {
        inputRef.select()
        document.execCommand('copy')
        toastr.info(successText ? successText : 'Address copied to clipboard')
      },
    }
  })
)(({ handleFocus, handleRef, handleCopy, autoFocus = true, ...props }) => (
  <Row className='gutter-2 my-2'>
    <Col>
      <Input type='text' autoFocus={autoFocus} readOnly onFocus={handleFocus} innerRef={handleRef} {...props}/>
    </Col>
    <Col xs='auto'>
      <Button color='link' className='p-2' onClick={handleCopy}><i className='fa fa-copy'/></Button>
    </Col>
  </Row>
))
