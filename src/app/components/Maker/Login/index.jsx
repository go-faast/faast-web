import React, { Fragment } from 'react'
import { push } from 'react-router-redux'
import { createStructuredSelector } from 'reselect'
import { Card, CardHeader, CardBody } from 'reactstrap'
import { connect } from 'react-redux'
import { compose, setDisplayName, lifecycle } from 'recompose'
import classNames from 'class-names'
import LoginForm from './form'

import { withAuth } from 'Components/Auth'
import MakerLayout from 'Components/Maker/Layout'
import { isMakerLoggedIn } from 'Selectors/maker'

import { card, cardHeader, smallCard } from '../style'

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
    loggedIn: isMakerLoggedIn
  }), {
    push: push,
  }),
  lifecycle({
    componentDidMount() {
      const { push, loggedIn } = this.props
      if (loggedIn) {
        push('/makers/dashboard')
      }
    }
  })
)(MakerLogin)
