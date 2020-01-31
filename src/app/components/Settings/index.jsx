import React from 'react'
import { compose, setDisplayName, withHandlers } from 'recompose'
import { Row, Col, Card, CardBody, CardHeader } from 'reactstrap'
import { push as pushAction } from 'react-router-redux'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import Sidebar from 'Components/Sidebar'
import Layout from 'Components/Layout'
import { handleRememberWallets } from 'Actions/app'
import LanguageSelector from 'Components/LanguageSelector'
import CurrencySelector from 'Components/CurrencySelector'

import { shouldRememberWallets } from 'Selectors/app'
import style from './style.scss'
import classNames from 'class-names'

export default compose(
  setDisplayName('Settings'),
  connect(createStructuredSelector({
    shouldRememberWallets
  }), {
    push: pushAction,
    handleRememberWallets
  }),
  withHandlers({
    handleSelectLanguage: ({ push, location }) => () => {
      push(location.pathname)
    },
    handleRememberWalletSetting: ({ handleRememberWallets, shouldRememberWallets }) => () => {
      if (shouldRememberWallets === 'local') {
        shouldRememberWallets = 'session'
      } else {
        shouldRememberWallets = 'local'
      }
      handleRememberWallets(shouldRememberWallets)
    }
  }),
)(({ handleSelectLanguage, shouldRememberWallets, handleRememberWalletSetting }) => (
  <Layout className='pt-3'>
    <Row className='gutter-3'>
      <Col xs='12' md='5' lg='4' xl='3'>
        <Sidebar/>
      </Col>
      <Col xs='12' md='7' lg='8' xl='9'>
        <Row className='gutter-3'>
          <Col xs='12'>
            <Card>
              <CardHeader>
                <h5>Settings</h5>
              </CardHeader>
              <CardBody>
                <Row>
                  <Col className='mb-3' sm='12'>
                    Language
                    <LanguageSelector onSelect={handleSelectLanguage} border />
                  </Col>
                  <Col className='mb-3' sm='12'>
                    Currency
                    <CurrencySelector onSelect={handleSelectLanguage} />
                  </Col>
                  <Col className='mb-3' sm='12'>
                    Remember my connected wallets
                    <div className='mt-2'>
                      <label className={style.switcher}>
                        <input type='checkbox' onClick={handleRememberWalletSetting} checked={shouldRememberWallets === 'local'} />
                        <span className={classNames(style.slider, style.round)}></span>
                      </label>
                    </div>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Col>
    </Row>
  </Layout>
))
