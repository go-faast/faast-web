import React, { Fragment } from 'react'
// import { Link } from 'react-router-dom'
import { createStructuredSelector } from 'reselect'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import { compose, setDisplayName, withHandlers } from 'recompose'
import { Row, Col, Card, Input, CardHeader, CardBody, Button } from 'reactstrap'
import classNames from 'class-names'

import { makerId, getMakerProfile, isMakerDisabled, isAbleToRetractCapacity } from 'Selectors/maker'
import { disableMaker, enableMaker } from 'Actions/maker'

import MakerLayout from 'Components/Maker/Layout'
import { card, cardHeader, input, text, smallCard } from '../style'
import style from './style.scss'

const MakerSettings = ({ makerId, isMakerDisabled, handleSwitch, isAbleToRetractCapacity,
  profile: { swapMarginMin, swapMarginMax, assetsEnabled } = {} }) => {
  return (
    <MakerLayout className='pt-3'>
      <Row className='mt-4'>
        <Col>
          <Card className={classNames('mx-auto', card, smallCard)}>
            <CardHeader className={cardHeader}>Maker Settings</CardHeader>
            <CardBody>
              <Row className='gutter-y-3'>
                <Col sm='12'>
                  <small><p className={classNames('mt-1 mb-1 font-weight-bold', text)}>Maker ID</p></small>
                  <Input className={classNames('flat', input)} value={makerId} type='text' autoFocus readOnly/>
                </Col>
                <hr className='w-100 border-light'/>
                <Col sm='12'>
                  <small><p className={classNames('mt-1 mb-1 font-weight-bold', text)}>Supported Assets</p></small>
                  {!assetsEnabled || (assetsEnabled && assetsEnabled.length == 0) ? (
                    <span className={text}>Your maker supports all available assets.</span>
                  ) : (
                    <span className={text}>Your maker supports {assetsEnabled.map((a,i) => 
                      <span key={a}>{i < assetsEnabled.length - 1 ? `${a} ` : `and ${a}`}</span>
                    )}.</span>
                  )}
                </Col>
                <hr className='w-100 border-light'/>
                <Col sm='12'>
                  <small><p className={classNames('mt-1 mb-1 font-weight-bold', text)}>{isMakerDisabled ? 'Enable' : 'Disable'} Maker</p></small>
                  <div className='mt-2'>
                    <label className={style.switcher}>
                      <input type='checkbox' onClick={handleSwitch} checked={!isMakerDisabled} />
                      <span className={classNames(style.slider, style.round)}></span>
                    </label>
                  </div>
                </Col>
                <hr className='w-100 border-light'/>
                <Col sm='12'>
                  <small><p className={classNames('mt-1 mb-1 font-weight-bold', text)}>Withdraw BTC Capacity</p></small>
                  <span style={{ fontWeight: 600 }} className={classNames(text)}>Steps to withdrawal capacity:</span>
                  <ol className={text}>
                    <li>Disable Maker</li>
                    <li>Wait 72 hours (Your maker must be disabled for 72 hours to ensure all of your in progress trades have been completed before withdrawing)</li>
                    <li>Click the button below and enter the amount you would like to withdrawal</li>
                  </ol>
                  <Button 
                    color='primary' 
                    size='md' 
                    onClick={() => push('/makers/settings/retract')}
                    disabled={!isAbleToRetractCapacity}
                  >
                    Withdraw Capacity
                  </Button>
                </Col>
                {swapMarginMin && swapMarginMax ? (
                  <Fragment>
                    <Col sm='12'>
                      <small><p className={classNames('mt-1 mb-1 font-weight-bold', text)}>Margin Range</p></small>
                      <span className={text}>Your maker will fulfill any swaps with a margin of <b>{swapMarginMin}%</b> - <b>{swapMarginMax}%.</b></span>
                    </Col>
                    <hr className='w-100 border-light'/>
                  </Fragment>
                ) : null}
                <Col sm='12'>
                  <small><p className={classNames('mb-1 font-weight-bold', text)}>Have a question?</p></small>
                  <span className={text}>Email us at support@faa.st</span>
                </Col>
              </Row>
            </CardBody>
          </Card>
          {/* <Link to='/makers/terms' style={{ color: '#8aa2b5' }} className='pt-3 d-block font-weight-bold font-xs text-center'>
              Read the Faa.st Maker Terms
          </Link> */}
        </Col>
      </Row>
    </MakerLayout>
  )
}

export default compose(
  setDisplayName('MakerSettings'),
  connect(createStructuredSelector({
    makerId,
    profile: getMakerProfile,
    isMakerDisabled,
    isAbleToRetractCapacity
  }), {
    push,
    disableMaker,
    enableMaker
  }),
  withHandlers({
    handleSwitch: ({ isMakerDisabled, disableMaker, enableMaker }) => () => {
      if (isMakerDisabled) {
        enableMaker()
      } else {
        disableMaker()
      }
    }
  })
)(MakerSettings)
