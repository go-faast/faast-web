/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react/jsx-no-comment-textnodes */
import React from 'react'
import { compose, setDisplayName, withState } from 'recompose'
import classNames from 'class-names'
import Typing from 'react-typing-animation'

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

const Terminal = ({ response }) => {
  return (
    <div style={{ backgroundImage: `url(${GithubBg})` }} className={classNames(style.terminalSection, 'text-center mt-5 pt-5 mx-auto position-relative')}>
      <h1 className={classNames(homeStyle.heading, 'mt-5 pt-5 mb-4')}>Open Source and Public API</h1>
      <h3 className={classNames(homeStyle.description, 'pb-4')}>
        Want to run your own instance of the Faa.st trading portfolio? No problem. The open source <a className={classNames(homeStyle.link, 'd-inline-block')} href='https://github.com/go-faast/faast-web'>Faa.st Portfolio</a> project on GitHub and <a className={classNames(homeStyle.link, 'd-inline-block')} href='https://api.faa.st'>public API</a> put you in full control of how you want to use Faa.st.
      </h3>
      <div className={classNames(style.terminal, 'mx-auto mt-5')}>
        <div className={style.terminalActions}>
          <div className={style.close}></div>
          <div className={style.minimize}></div>
          <div className={style.expand}></div>
        </div>
        <div className={style.terminalHeaderbar}></div>
        <div className={style.terminalSidebar}></div>
        <div className='pt-5 pl-5 text-left'>
          <Typing>
            <Typing.Speed ms={10} />
            <p className={classNames(style.comment, 'mb-0')}>
              <small>// create swap</small>
            </p>
            <p>
              <small><span className={style.await}>await</span> http.<span className={style.func}>post</span>('https://api.faast/api/v2/public/swap')</small>
            </p>
            <Typing.Delay ms={1000} />
            <Typing.Speed ms={0.0000000000001} />
            <p className='m-0'>
              <small>{'{'}</small>
            </p>
            {response.map(({ key, value }) => {
              return (
                <p style={{ lineHeight: '18px' }} className='p-0 m-0' key={key}>
                  <small className={classNames(style.key, 'ml-4 mr-2')}>{key}:</small>
                  <small className={style.value}>{value}</small>
                </p>
              )
            })}
            <p className='m-0'>
              <small>{'}'}</small>
            </p>
            <Typing.Delay ms={3000} />
          </Typing>
        </div>
      </div>
    </div>
  )}

export default compose(
  setDisplayName('Terminal'),
  withState('response', 'updateResponse', json)
)((Terminal))