import React from 'react'
import PropTypes from 'prop-types'
import { compose, setDisplayName, setPropTypes, lifecycle, withHandlers } from 'recompose'
import { Modal, ModalHeader, ModalBody, Card, CardBody, Input, Button, Row, Col } from 'reactstrap'
import { pick } from 'lodash'

import routes from 'Routes'
import { routerPathToUri } from 'Utilities/helpers'
import toastr from 'Utilities/toastrWrapper'
import WalletSummary from 'Components/WalletSummary'

const closeCondition = ({ wallet }) => !wallet.address

export default compose(
  setDisplayName('ShareModal'),
  setPropTypes({
    wallet: PropTypes.object.isRequired,
    ...Modal.propTypes
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
      handleCopy: () => () => {
        inputRef.select()
        document.execCommand('copy')
        toastr.info('Link copied to clipboard')
      },
    }
  }),
  lifecycle({
    componentWillMount() {
      if (this.props.isOpen && closeCondition(this.props)) {
        this.props.toggle()
      }
    },
    componentWillReceiveProps(next) {
      if (next.isOpen && closeCondition(next)) {
        next.toggle()
      }
    }
  })
)(({ wallet, toggle, handleRef, handleFocus, handleCopy, ...props }) => (
  <Modal size='sm' toggle={toggle} {...pick(props, Object.keys(Modal.propTypes))}>
    <ModalHeader tag='h3' className='text-primary' toggle={toggle}>
      Share Portfolio
    </ModalHeader>
    <ModalBody>
      <Card tag={CardBody} color='ultra-dark' className='flat mb-3'>
        <WalletSummary wallet={wallet}/>
      </Card>
      <p className='mb-2'>Permalink:</p>
      <Row className='gutter-2'>
        <Col>
          <Input type='text' autoFocus readOnly onFocus={handleFocus} innerRef={handleRef}
            value={routerPathToUri(routes.viewOnlyAddress(wallet.address))}/>
        </Col>
        <Col xs='auto'>
          <Button color='link' className='p-2' onClick={handleCopy}>
            <i className='fa fa-copy'/>
          </Button>
        </Col>
      </Row>
    </ModalBody>
  </Modal>
))
      