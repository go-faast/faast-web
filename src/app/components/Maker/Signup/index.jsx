import React, { Fragment } from 'react'
import { Helmet } from 'react-helmet'
import { Link } from 'react-router-dom'
import { Card, CardHeader, CardBody } from 'reactstrap'
import { compose, setDisplayName } from 'recompose'
import classNames from 'class-names'
import LoginForm from './form'

import MakerLayout from 'Components/Maker/Layout'

import { card, cardHeader, smallCard } from '../style'

const MakerSignup = () => {
  return (
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
            <LoginForm/>
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
)(MakerSignup)
