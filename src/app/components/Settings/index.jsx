import React from 'react'
import { compose, setDisplayName, withHandlers } from 'recompose'
import { Row, Col, Card, CardBody, CardHeader } from 'reactstrap'
import { push as pushAction } from 'react-router-redux'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import Sidebar from 'Components/Sidebar'
import Layout from 'Components/Layout'
import LanguageSelector from 'Components/LanguageSelector'
import CurrencySelector from 'Components/CurrencySelector'

export default compose(
  setDisplayName('Settings'),
  connect(createStructuredSelector({
  }), {
    push: pushAction
  }),
  withHandlers({
    handleSelectLanguage: ({ push, location }) => () => {
      push(location.pathname)
    }
  }),
)(({ handleSelectLanguage }) => (
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
                </Row>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Col>
    </Row>
  </Layout>
))
