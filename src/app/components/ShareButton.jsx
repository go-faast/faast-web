import React from 'react'
import PropTypes from 'prop-types'
import { compose, setDisplayName, setPropTypes, defaultProps } from 'recompose'
import { Button } from 'reactstrap'

import withToggle from 'Hoc/withToggle'
import ShareModal from 'Components/ShareModal'

export default compose(
  setDisplayName('ShareButton'),
  setPropTypes({
    wallet: PropTypes.object,
  }),
  defaultProps({
    wallet: null,
  }),
  withToggle('open', false),
)(({ wallet, isOpen, toggleOpen }) => (
  <Button color='light' size='sm' disabled={!(wallet && wallet.address)} onClick={toggleOpen}>
    <i className='fa fa-share'/> share
    { wallet && (<ShareModal wallet={wallet} isOpen={isOpen} toggle={toggleOpen} />)}
  </Button>
))
