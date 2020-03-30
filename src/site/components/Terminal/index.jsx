/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react/jsx-no-comment-textnodes */
import React, { Fragment } from 'react'
import { compose, setDisplayName, withState, defaultProps } from 'recompose'
import classNames from 'class-names'

import GithubBg from 'Img/github-bg.svg'

import style from './style.scss'
import homeStyle from 'Site/pages/Home1/style.scss'

const json = [{
  key: 'swap_id',
  value: "'30711734-e4ee-4ff1-a45b'"
}, {
  key: 'deposit_address',
  value: "'0x94fa1b52E7B6282dad0213e17A8BF7B2538b4b1E'"
}, {
  key: 'deposit_amount',
  value: '0.02'
}, {
  key: 'deposit_currency',
  value: "'ETH'"
}, {
  key: 'price',
  value: '0.035'
}, {
  key: 'withdrawal_amount',
  value: '0.5573'
}, {
  key: 'withdrawal_address',
  value: "'0x3d6Bb40C0dDe451812A935163cC57974063b8dA3'"
}, {
  key: 'withdrawal_currency',
  value: "'BAT'"
}]

const Terminal = ({ response, theme, includeCopy, includeBg, translations: { static: { terminal: t } } }) => {
  return (
    <div style={{ backgroundImage: includeBg && `url(${GithubBg})`, paddingBottom: !includeBg && 0 }} className={classNames(homeStyle.sectionContainer, style.terminalSection, 'text-center mx-auto position-relative px-sm-0 px-2')}>
      {includeCopy && (
        <Fragment>
          <h1 className={classNames(homeStyle.heading, 'mb-4')}>{t.becomeAffiliate}</h1>
          <h3 className={classNames(homeStyle.description, 'pb-4 px-md-0 px-3')}>
            {t.readyToMonetize} <a className={classNames(homeStyle.link, 'd-inline-block')} href='https://faa.st/partners'>{t.affiliateProgram}</a>. {t.features}
          </h3>
        </Fragment>
      )}
      <div className={classNames(theme === 'light' && style.terminalLight, style.terminal, 'mx-auto mt-5')}>
        <div className={style.terminalActions}>
          <div className={style.close}></div>
          <div className={style.minimize}></div>
          <div className={style.expand}></div>
        </div>
        <div className={classNames(theme === 'light' && style.terminalHeaderbarLight, style.terminalHeaderbar)}></div>
        <div className={style.terminalSidebar}></div>
        <div className='pt-5 pl-sm-5 pl-3 text-left'>
          <p className={classNames(style.comment, 'mb-0')}>
            <small>// {t.createSwap}</small>
          </p>
          <p className={style.ellipsis}>
            <small><span className={style.await}>await</span> http.<span className={classNames(theme === 'light' && style.funcLight, style.func)}>post</span>('https://api.faast/api/v2/public/swap')</small>
          </p>
          <p className='m-0'>
            <small>{'{'}</small>
          </p>
          {response.map(({ key, value }) => {
            return (
              <p style={{ lineHeight: '18px' }} className={classNames(style.ellipsis, 'p-0 m-0')} key={key}>
                <small className={classNames(theme === 'light' && style.keyLight, style.key, 'ml-4 mr-2')}>{key}:</small>
                <small className={classNames(theme === 'light' && style.valueLight, style.value)}>{value}</small>
              </p>
            )
          })}
          <p className='m-0'>
            <small>{'}'}</small>
          </p>
        </div>
      </div>
    </div>
  )}

export default compose(
  setDisplayName('Terminal'),
  defaultProps({
    includeCopy: true,
    includeBg: true,
    theme: 'dark'
  }),
  withState('response', 'updateResponse', json)
)((Terminal))