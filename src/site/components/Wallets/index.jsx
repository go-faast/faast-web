import React from 'react'
import { compose, setDisplayName } from 'recompose'
import classNames from 'class-names'

import Icon from 'Components/Icon'
import LangLink from 'Components/LangLink'

import style from './style.scss'
import homeStyle from 'Site/pages/Home1/style.scss'

import WalletConfig from 'Config/walletTypes'

const Wallets = () => {
  const supportedWallets = Object.values(WalletConfig)
  return (
    <div className={classNames(style.sectionContainer, 'text-center')}>
      <h1 className={homeStyle.heading}>Supported Wallets</h1>
      <div className={classNames(style.walletsContainer, 'mx-auto')}>
        {supportedWallets.filter(w => w.active).map(wallet => {
          const url = wallet.name.replace(' ', '-').toLowerCase()
          return ( 
            <LangLink className={style.walletBubble} key={wallet.name} to={`/wallets/${url}`}>
              <Icon src={wallet.inverseIcon || wallet.icon} />
              <p className={homeStyle.text}>
                <small>{wallet.name}</small>
              </p>
            </LangLink>
          )
        })}
      </div>
    </div>
  )}

export default compose(
  setDisplayName('Wallets'),
)((Wallets))