import React, { Fragment } from 'react'
import Header from 'Site/components/Header'
import { compose, setDisplayName, setPropTypes, defaultProps } from 'recompose'
import { Row, Col } from 'reactstrap'
import classNames from 'class-names'
import PropTypes from 'prop-types'

import Icon from 'Components/Icon'

import style from './style.scss'
import homeStyle from 'Site/pages/Home1/style.scss'

import WalletConfig from 'Config/walletTypes'

const Wallets = ({ translations }) => {
  const supportedWallets = Object.values(WalletConfig)
  return (
    <div className='text-center mt-5'>
      <h1 className={homeStyle.heading}>Supported Wallets</h1>
      <div className={classNames(style.walletsContainer, 'mx-auto mt-5 pt-4')}>
        {supportedWallets.map(wallet => {
          return ( 
            <div key={wallet.name} className={style.walletBubble}>
              <Icon src={wallet.icon} />
              <p className={homeStyle.text}>
                <small>{wallet.name}</small>
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )}

export default compose(
  setDisplayName('Wallets'),
)((Wallets))