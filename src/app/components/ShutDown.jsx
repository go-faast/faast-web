import React from 'react'
import { compose, setDisplayName, } from 'recompose'
import { Card, CardHeader, CardBody, CardFooter } from 'reactstrap'
import Overlay from 'Components/Overlay'
import EmailForm from 'Site/components/InlineEmailForm'

export default compose(
  setDisplayName('ShutDown'),
)(({ handleCloseModal }) => (
  <Overlay style={{ zIndex: 1030, position: 'fixed', height: '100vh' }}>
    <Card style={{ minWidth: '320px', maxWidth: '600px', width: '90%' }} className='mx-auto mt-5'>
      <CardHeader className='position-relative'>
        <span>Swap Service Announcement</span>
        <span style={{ right: 15 }} className='cursor-pointer position-absolute' onClick={handleCloseModal}>✕</span>
      </CardHeader>
      <CardBody>
        <p>We regret to say that after 3 years and over 150K swaps completed, Faa.st will shut down its swap service on June 7, 2021. The portfolio and wallet features, however, will still remain online and available to use.</p>
        <p>Thank you for your support throughout the years and if you are interested in hearing about our future projects you can join our mailing list below:</p>
      </CardBody>
      <CardFooter>
        <EmailForm height={'50'} />
      </CardFooter>
    </Card>
  </Overlay>
))
