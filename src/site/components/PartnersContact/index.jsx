import React from 'react'
import { Card, CardHeader, CardBody } from 'reactstrap'
import { compose, setDisplayName } from 'recompose'
import classNames from 'class-names'
import ContactForm from './form'

import { card, cardHeader, smallCard } from 'Components/Affiliate/style'

const PartnersContact = () => {
  return (
    <Card className={classNames(card, smallCard, 'mx-auto')}>
      <CardHeader className={classNames(cardHeader, 'text-center')}>
        <span>Get in touch</span>
      </CardHeader>
      <CardBody className={card}>
        <ContactForm/>
      </CardBody>
    </Card>
  )
}

export default compose(
  setDisplayName('PartnersContact'),
)(PartnersContact)
