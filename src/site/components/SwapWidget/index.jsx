import React from 'react'
import { compose, setDisplayName } from 'recompose'
import { Card, CardHeader, CardBody, Button, Form } from 'reactstrap'
import { container, section, submitButton, asset, icon, receive, swap, expnd, assetAddOnError, assetAddOn } from './style.scss'

import CoinIcon from 'Components/CoinIcon'
import classNames from 'class-names'

import SwapIcon from 'Img/swap-icon.svg?inline'

// const DEFAULT_DEPOSIT = 'BTC'
// const DEFAULT_RECEIVE = 'ETH'

const SwapWidget = () => (
  <Card className={classNames('container justify-content-center p-0', container)}>
    <CardHeader className='text-center pb-4'>
      <h4 className='mb-3 mt-1'>Swap Instantly</h4>
      <Button color='ultra-dark' className='flat mb-3 p-0' onClick={() => console.log('click')}>
        <div className={asset}>
          <CoinIcon key={'BTC'} symbol={'BTC'} style={{ width: 48, height: 48 }} className='m-1'/>
          <h4 className='m-0'>{'BTC'}</h4>
          <p>Deposit</p>
        </div>
      </Button>
      <Button color='ultra-dark' className={classNames('flat', swap)} onClick={() => console.log('switch')}><SwapIcon/></Button>
      <Button color='ultra-dark' className='flat mb-3 p-0' onClick={() => console.log('click')}>
        <div className={asset}>
          <CoinIcon key={'ETH'} symbol={'ETH'} style={{ width: 48, height: 48 }} className='m-1'/>
          <h4 className='m-0'>{'ETH'}</h4>
          <p>Receive</p>
        </div>
      </Button>
    </CardHeader>
    <CardBody className='pt-1'>
      <Form onSubmit={() => console.log('submit')}>
        <Button className={classNames('mt-2 mb-2 mx-auto', submitButton)} color='primary' type='submit'>
          Continue
        </Button>
      </Form>
    </CardBody>
  </Card>
)

export default compose(
  setDisplayName('SwapWidget'),
)(SwapWidget)