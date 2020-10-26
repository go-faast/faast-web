import React, { Fragment } from 'react'
import { push } from 'react-router-redux'
import { createStructuredSelector } from 'reselect'
import { Card, CardHeader, CardBody } from 'reactstrap'
import { connect } from 'react-redux'
import { compose, setDisplayName, lifecycle } from 'recompose'
import classNames from 'class-names'

import { isAffiliateLoggedIn, isLoadingLogin } from 'Selectors'
import LoginForm from './form'

import MakerLayout from 'Components/Maker/Layout'
import LoadingFullScreen from 'Components/LoadingFullscreen'

import { card, cardHeader, smallCard, text } from '../style'

const MakerLogin = ({ isLoadingLogin }) => {
  return (
    <Fragment>
      {isLoadingLogin ? (
        <LoadingFullScreen bgColor='#fff' label={<span className={text}>Loading Maker Stats...</span>} />
      ) : (
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
      )}
    </Fragment>
  )
}

export default compose(
  setDisplayName('MakerLogin'),
  connect(createStructuredSelector({
    loggedIn: isAffiliateLoggedIn,
    isLoadingLogin
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
    componentDidUpdate() {
      const { loggedIn, push } = this.props
      if (loggedIn) {
        push('/makers/dashboard')
      }
    }
  })
)(MakerLogin)
