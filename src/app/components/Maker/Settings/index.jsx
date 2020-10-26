import React from 'react'
import { Link } from 'react-router-dom'
import { createStructuredSelector } from 'reselect'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import { compose, setDisplayName, withHandlers, lifecycle, withState } from 'recompose'
import { Row, Col, Card, Input, CardHeader, CardBody } from 'reactstrap'
import classNames from 'class-names'

import { makerId, secretKey, getAffiliateBalance, 
  isLoadingLogin, isMakerLoggedIn } from 'Selectors/Maker'

import AffiliateLayout from 'Components/Affiliate/Layout'
import { card, cardHeader, input, text, smallCard } from '../style'

const MakerSettings = ({ makerId, secretKey, keyInputType, handleInputType }) => {
  return (
    <AffiliateLayout className='pt-3'>
      <Row className='mt-4'>
        <Col>
          <Card className={classNames('mx-auto', card, smallCard)}>
            <CardHeader className={cardHeader}>Maker Settings</CardHeader>
            <CardBody>
              <Row className='gutter-y-3'>
                <Col sm='12'>
                  <small><p className={classNames('mt-1 mb-1 font-weight-bold', text)}>Maker Id</p></small>
                  <Input className={classNames('flat', input)} value={makerId} type='text' autoFocus readOnly/>
                </Col>
                <Col sm='12'>
                  <small><p className={classNames('mb-1 font-weight-bold', text)}>Secret Key</p></small>
                  <div className='position-relative'>
                    <Input className={classNames('flat', input)} value={secretKey} type={keyInputType} autoFocus readOnly/>
                    <span 
                      className='text-dark position-absolute cursor-pointer' 
                      style={{ fontSize: 14, right: 16, top: 10 }}
                      onClick={handleInputType}
                    >
                      <i className={`fa ${keyInputType === 'password' ? 'fa-eye' : 'fa-eye-slash'}`}></i>
                    </span>
                  </div>
                </Col>
                <hr className='w-100 border-light'/>
              </Row>
            </CardBody>
          </Card>
          <Link to='/maker/terms' style={{ color: '#8aa2b5' }} className='pt-3 d-block font-weight-bold font-xs text-center'>
              Read the Faa.st Maker Terms
          </Link>
        </Col>
      </Row>
    </AffiliateLayout>
  )
}

export default compose(
  setDisplayName('MakerSettings'),
  connect(createStructuredSelector({
    makerId,
    secretKey,
    balance: getAffiliateBalance,
    isLoadingLogin,
    loggedIn: isMakerLoggedIn,
  }), {
    push,
  }),
  withState('keyInputType', 'updateKeyInputType', 'password'),
  withHandlers({
    handleInputType: ({ keyInputType, updateKeyInputType }) => () => {
      if (keyInputType === 'password') {
        updateKeyInputType('text')
      } else {
        updateKeyInputType('password')
      }
    },
  }),
  lifecycle({
    componentDidMount() {
      const { loggedIn, push, isLoadingLogin } = this.props
      if (!loggedIn && !isLoadingLogin) {
        push('/makers/login')
      }
    },
    componentDidUpdate() {
      const { loggedIn, push, isLoadingLogin } = this.props
      if (!loggedIn && !isLoadingLogin) {
        push('/makers/login')
      }
    }
  }),
)(MakerSettings)
