import React, { Fragment } from 'react'
import { push } from 'react-router-redux'
import { Link } from 'react-router-dom'
import { createStructuredSelector } from 'reselect'
import { Card, CardHeader, CardBody } from 'reactstrap'
import { connect } from 'react-redux'
import { compose, setDisplayName, lifecycle } from 'recompose'
import classNames from 'class-names'

import { isAffiliateLoggedIn } from 'Selectors'
import LoginForm from './form'

import AffiliateLayout from 'Components/Affiliate/Layout'

import { card, cardHeader } from '../style'

const AffiliateSignup = () => {
  return (
    <AffiliateLayout className='pt-5'>
      <Card className={classNames(card, 'mx-auto')}>
        <CardHeader className={classNames(cardHeader, 'text-center')}>
          <span>Affiliate API Signup</span>
        </CardHeader>
        <CardBody className={card}>
          <LoginForm/>
        </CardBody>
      </Card>
      <small className='text-center'>
        <Link to='/affiliates/login' style={{ color: '#8aa2b5' }} className='pt-3 d-block font-weight-bold'>
          Already registered with the Faa.st Affiliate API? Login here.
        </Link>
      </small>
    </AffiliateLayout>
  )
}

export default compose(
  setDisplayName('AffiliateSignup'),
  connect(createStructuredSelector({
    loggedIn: isAffiliateLoggedIn,
  }), {
    push: push,
  })
)(AffiliateSignup)
