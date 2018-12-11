import React from 'react'
import { compose, setDisplayName, } from 'recompose'
import { Card, CardHeader, CardBody, CardFooter } from 'reactstrap'
import Overlay from 'Components/Overlay'

import GrumpyCat from 'Img/grumpy-cat.gif'

export default compose(
  setDisplayName('Blocked'),
)(() => (
  <Overlay style={{ zIndex: 1030, position: 'fixed', height: '100vh' }}>
    <Card style={{ minWidth: '320px', maxWidth: '600px', width: '90%' }} className='mx-auto mt-5'>
      <CardHeader>
    Restricted Area
      </CardHeader>
      <CardBody>
        <img className='d-block mx-auto mb-2' style={{ minWidth: '320px', maxWidth: '400px', width: '95%' }} src={GrumpyCat}/>
      </CardBody>
      <CardFooter>
      Sorry, you are accessing faa.st from a blocked location. 
        If you are getting this message in error, you can learn more <a href='https://medium.com/faast/faast-location-restrictions-9b14e100d828' target='_blank noopener noreferrer'>here.</a>
      </CardFooter>
    </Card>
  </Overlay>
))
