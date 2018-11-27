import React from 'react'
import { compose, setDisplayName, } from 'recompose'
import { Card, CardHeader, CardBody, CardFooter, Button } from 'reactstrap'
import Overlay from 'Components/Overlay'

export default compose(
  setDisplayName('Blocked'),
)(() => (
  <Overlay style={{ zIndex: 1030, position: 'fixed', height: '100vh' }}>
    <Card style={{ minWidth: '320px', maxWidth: '600px', width: '90%' }} className='mx-auto mt-5'>
      <CardHeader>
    Restricted Area
      </CardHeader>
      <CardBody>
      Unfortunately, you are currently in a location that Faa.st is unable to serve due to legal restrictions on cryptocurrency.
      </CardBody>
      <CardFooter>
        <Button tag='a' href='https://faa.st' size='sm' color='primary'>Back to Home Page</Button>
      </CardFooter>
    </Card>
  </Overlay>
))
