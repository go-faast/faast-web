import React from 'react'
import { Modal as ModalReactstrap } from 'reactstrap'

const Modal = (props) => (
  // addKeys([
  <div onClick={props.handleClick}>
    <ModalReactstrap {...props.modalProps}>
      {props.modalChildren}
    </ModalReactstrap>
  </div>
)

export default Modal
