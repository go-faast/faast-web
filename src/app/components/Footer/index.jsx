import * as React from 'react'
import { compose, setDisplayName, setPropTypes, defaultProps } from 'recompose'
import { Container, Row, Col } from 'reactstrap'
import PropTypes from 'prop-types'
import { name as appName, version as appVersion, homepage as githubLink } from 'Pkg'

import T from 'Components/i18n/T'

export default compose(
  setDisplayName('Footer'),
  setPropTypes({
    footerClass: PropTypes.string
  }),
  defaultProps({
    footerClass: ''
  }),
)(({ footerClass }) => (
  <div style={{ opacity: .6 }} className='pb-2'>
    <footer>
      <Container className={footerClass}>
        <Row>
          <Col xs='4'>
            <ul className='list-inline'>
              <li className='list-inline-item mr-3'>
                <small><a className='text-muted' href='https://faa.st'>
                  <T tag='span' i18nKey='app.footer.website'>Faa.st Website</T>
                </a></small>
              </li>
              <li className='list-inline-item mr-3'>
                <small><a className='text-muted' href='https://faa.st/terms'>
                  <T tag='span' i18nKey='app.footer.termsConditions'>Terms & Conditions</T>
                </a></small>
              </li>
              <li className='list-inline-item'>
                <small><a className='text-muted' href='https://faa.st/privacy'>
                  <T tag='span' i18nKey='app.footer.privacy'>Privacy Policy</T>
                </a></small>
              </li>
            </ul>
          </Col>
          <Col className='text-right'>
            <ul className='list-inline'>
              <li className='list-inline-item mr-3'>
                <small><a className='text-muted' href={githubLink}>{appName} v{appVersion}</a></small>
              </li>
              <li className='list-inline-item'>
                <small><p className='text-muted'>support@faa.st</p></small>
              </li>
            </ul>
          </Col>
        </Row>
      </Container>
    </footer>
  </div>
))