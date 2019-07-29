/* eslint-disable react/jsx-no-comment-textnodes */
import React, { Fragment } from 'react'
import Header from 'Site/components/Header'
import { compose, setDisplayName, setPropTypes, defaultProps } from 'recompose'
import { Row, Col } from 'reactstrap'
import classNames from 'class-names'
import PropTypes from 'prop-types'

import Icon from 'Components/Icon'

import style from './style.scss'
import homeStyle from 'Site/pages/Home1/style.scss'


const Terminal = ({ translations }) => {
  return (
    <div className={classNames(style.terminalSection, 'text-center mt-5 pt-5 mx-auto')}>
      <h1 className={classNames(homeStyle.heading, 'mt-5 pt-5 mb-4')}>Open Source and Public API</h1>
      <h3 className={homeStyle.description}>
        Want to run your own instance of the Faa.st trading portfolio? No problem.  The open source Faa.st Portfolio project on GitHub and public API put you in full control of how you want to use Faa.st.
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
          <p className={style.comment}>
            <small>// create swap</small>
          </p>
          <p className='text-white'>
            <small>Response: <span className={style.success}>200</span></small>
          </p>
          <p>
            {'{'}
          </p>
          <p>
            {'}'}
          </p>
        </div>
      </div>
    </div>
  )}

export default compose(
  setDisplayName('Terminal'),
)((Terminal))