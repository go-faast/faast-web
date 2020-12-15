import React, { Fragment } from 'react'
import { Helmet } from 'react-helmet'
import { Link } from 'react-router-dom'
import { Card, CardHeader, CardBody } from 'reactstrap'
import { compose, lifecycle, setDisplayName, withState } from 'recompose'
import classNames from 'class-names'
import { withAuth } from 'Components/Auth'
import SignupForm from './form'
import LoadingFullscreen from 'Components/LoadingFullscreen'
import MakerLayout from 'Components/Maker/Layout'

import { card, cardHeader, smallCard } from '../style'

const MakerSignup = ({ isLoading }) => {
  return isLoading ? (
    <LoadingFullscreen bgColor='#fff' />
  ) : (
    <Fragment>
      <Helmet>
        <title>Faa.st Market Maker Program - Sign up</title>
        <meta name='description' content='Earn passive interest on your Bitcoin by fulfilling swaps as a member of the Faa.st Maker Maker program.' /> 
      </Helmet>
      <MakerLayout className='pt-5'>
        <Card className={classNames(card, smallCard, 'mx-auto')}>
          <CardHeader className={classNames(cardHeader, 'text-center')}>
            <span>Market Maker Signup</span>
          </CardHeader>
          <CardBody className={card}>
            <SignupForm/>
          </CardBody>
        </Card>
        <small className='text-center'>
          <Link to='/makers/login' style={{ color: '#8aa2b5' }} className='pt-3 d-block font-weight-bold'>
          Already registered as a Faa.st Market Maker? Login here.
          </Link>
        </small>
      </MakerLayout>
    </Fragment>
  )
}

export default compose(
  setDisplayName('MakerSignup'),
  withAuth(),
  withState('isLoading', 'updateIsLoading', true),
  lifecycle({
    componentDidMount() {
      const { auth, updateIsLoading } = this.props
      auth.signUp()
      setTimeout(() => {
        updateIsLoading(false)
      }, 3000)
    }
  })
)(MakerSignup)
