import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import { compose, setDisplayName, setPropTypes } from 'recompose'
import { Modal, ModalBody, ModalHeader } from 'reactstrap'
import { pick } from 'lodash'

import Icon from 'Components/Icon'
import config from 'Config'
import AppStoreLinks from 'Components/AppStoreLinks'

const { walletTypes } = config
const { metamask, status, mist, coinbase } = walletTypes

const walletInformation = {
  metamask: (
    <Fragment>
      <p>{metamask.name} is a desktop browser extension that provides an Ethereum wallet. You can get it <a href={metamask.website}>here.</a></p>
      <p>If you already have {metamask.name}, ensure the extension is enabled on this browser.</p>
    </Fragment>
  ),
  mist: (
    <Fragment>
      <p>{mist.name} is a desktop web browser with a built-in Ethereum wallet. You can get it <a href={mist.website}>here.</a></p>
      <p>If you already have {mist.name}, open <a href='https://faa.st/app'>faa.st</a> using its built in web browser.</p>
    </Fragment>
  ),
  status: (
    <Fragment>
      <p>{status.name} is a mobile Ethereum OS for iOS and Android. You can learn more about it <a href={status.website}>here.</a></p>
      <div className='mb-3'>
        <AppStoreLinks
          google='https://play.google.com/store/apps/details?id=im.status.ethereum'
          apple='https://testflight.apple.com/join/J8EuJmey'/>
      </div>
      <p>If you already have {status.name}, open <a href='https://faa.st/app'>faa.st</a> using its built in web browser.</p>
    </Fragment>
  ),
  coinbase: (
    <Fragment>
      <p>{coinbase.name} is a mobile Ethereum wallet for iOS and Android. You can get it <a href={coinbase.website}>here</a> or use one of the links below.</p>
      <div className='mb-3'>
        <AppStoreLinks
          google='https://play.google.com/store/apps/details?id=org.toshi'
          apple='https://itunes.apple.com/app/coinbase-wallet/id1278383455?ls=1&amp;mt=8'/>
      </div>
      <p>If you already have {coinbase.name}, open <a href='https://faa.st/app'>faa.st</a> using its built in web browser.</p>
    </Fragment>
  )
}

export default compose(
  setDisplayName('WalletInfoModal'),
  setPropTypes({
    walletType: PropTypes.string.isRequired,
    ...Modal.propTypes,
  })
)(({
  walletType, toggle, ...props,
}) => (
  <Modal
    size='md' toggle={toggle} className='mt-6 mx-md-auto' contentClassName='p-0'
    {...pick(props, Object.keys(Modal.propTypes))}>
    <ModalHeader tag='h4' toggle={toggle} className='text-primary'>
      <Icon key='icon' src={walletTypes[walletType].icon} height='20px' className='m-2' /> {walletTypes[walletType].name}
    </ModalHeader>
    <ModalBody className='p-2 p-sm-3'>
      {walletInformation[walletType]}
    </ModalBody>
  </Modal>
))
