import React from 'react'
import { ModalView as ModalReactstrap } from 'reactstrap'

const ModalView = (props) => (
  // addKeys([
  <div onClick={props.handleClick}>
    <ModalReactstrap {...props.modalProps}>
      {props.modalChildren}
    </ModalReactstrap>
  </div>
)

export default ModalView
