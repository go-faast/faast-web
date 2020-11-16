import React, { Fragment } from 'react'
import { push } from 'react-router-redux'
import { createStructuredSelector } from 'reselect'
import { Card, CardHeader, CardBody } from 'reactstrap'
import { connect } from 'react-redux'
import { compose, setDisplayName, lifecycle, withState } from 'recompose'
import classNames from 'class-names'
import LoginForm from './form'

import { withAuth } from 'Components/Auth'
import MakerLayout from 'Components/Maker/Layout'

import { card, cardHeader, smallCard, text } from '../style'

const MakerLogin = () => {
  return (
    <Fragment>
      <MakerLayout className='pt-5'>
        <Card className={classNames(card, smallCard, 'mx-auto')}>
          <CardHeader className={classNames(cardHeader, 'text-center')}>
            <span>Maker Login</span>
          </CardHeader>
          <CardBody className={card}>
            <LoginForm/>
          </CardBody>
        </Card>
      </MakerLayout>
    </Fragment>
  )
}

export default compose(
  setDisplayName('MakerLogin'),
  withAuth(),
  connect(createStructuredSelector({
  }), {
    push: push,
  }),
  lifecycle({
    componentWillMount() {
      const { loggedIn, push } = this.props
      if (loggedIn) {
        push('/makers/dashboard')
      }
    },
    componentDidUpdate(prevProps) {
      const { auth, push } = this.props
      if (auth.isAuthenticated() && !prevProps.auth.isAuthenticated()) {
        push('/makers/dashboard')
      }
    }
  })
)(MakerLogin)
