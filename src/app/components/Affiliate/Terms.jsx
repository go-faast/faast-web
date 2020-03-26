/* eslint-disable react/no-unescaped-entities */
import React from 'react'
import { compose, setDisplayName } from 'recompose'
import { Card, CardHeader, CardBody } from 'reactstrap'
import classNames from 'class-names'

import AffiliateLayout from 'Components/Affiliate/Layout'
import TermsText from 'Components/Affiliate/TermsText'

import { text, card, cardHeader } from './style'

export default compose(
  setDisplayName('AffiliateTerms'),
)(() => (
  <AffiliateLayout className='pt-5'>
    <div className='container my-4'>
      <Card className={card}>
        <CardHeader className={classNames(cardHeader, 'font-weight-bold')}>
          <h4>Faast Affiliate Agreement</h4>
        </CardHeader>
        <CardBody className={text}>
          <TermsText />
        </CardBody>
      </Card>
    </div>
  </AffiliateLayout>
))