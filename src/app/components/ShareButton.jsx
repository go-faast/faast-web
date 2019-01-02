import React from 'react'
import PropTypes from 'prop-types'
import { compose, setDisplayName, setPropTypes, defaultProps } from 'recompose'
import { Button } from 'reactstrap'

import withToggle from 'Hoc/withToggle'
import ShareModal from 'Components/ShareModal'
import Icon from 'Components/Icon'

import ShareIcon from 'Img/shareIcon.svg?inline'

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
  <Button tag='span' color='' size='sm' disabled={!(wallet && wallet.address)} onClick={toggleOpen}>
    <Icon src={ShareIcon} style={{ width: '14px', fill: '#fff' }} />
    {wallet && (<ShareModal wallet={wallet} isOpen={isOpen} toggle={toggleOpen} />)}
  </Button>
))
