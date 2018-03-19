import React from 'react'
import Units from 'Components/Units'
import { Row, Col, Button } from 'reactstrap'
import DerivationPathForm from 'Components/DerivationPathForm'
import styles from './style'

const HWAddressSelectView = (props) => (
  <div className={styles.container}>
    <div>
      <div className='text-small text-medium-grey text-center'>Select the address to use</div>
      <form className='form-check margin-bottom-10'>
        <div>
          {props.addresses.map((a, i) => (
            <div key={i} className='row margin-top-5'>
              <div className='col-sm-1 color-bg-1 padding-10 text-center'>
                <input
                  className={`form-check-input ${styles.checkInput}`}
                  type='radio'
                  value={i}
                  checked={props.addressIxSelected === String(i)}
                  onChange={props.handleSelectAddressIx}
                />
              </div>
              <div className='col-sm-7 color-bg-3 padding-10'>
                <a href={`https://etherscan.io/address/${a.address}`} className={`text-white word-break-all ${styles.address}`} target='_blank' rel='noopener'>
                  {a.address}
                </a>
              </div>
              <div className='col-sm-4 color-bg-3 padding-10'>
                {(a.hasOwnProperty('balance') &&
                  <div><Units value={a.balance} symbol='ETH'/></div>) ||
                  <div className='faast-loading loading-small margin-top-10 pull-right' />
                }
              </div>
            </div>
          ))}
        </div>
      </form>
      <div>
        <Row className='gutter-2 justify-content-between align-items-center'>
          <Col xs='auto'>
            <Button color='link' onClick={props.handleDecreaseIxGroup}>previous</Button>
          </Col>
          <Col xs='auto'>
            showing indexes {props.startIndex} - {props.endIndex}
          </Col>
          <Col xs='auto'>
            <Button color='link' onClick={props.handleIncreaseIxGroup}>next</Button>
          </Col>
        </Row>
      </div>
    </div>
    <div className='form-group'>
      <Button color='faast' onClick={props.handleAddressSubmit}>confirm</Button>
      <div className='margin-top-10'>
        {(props.showPathInput &&
          <DerivationPathForm
            onSubmit={props.handlePathSubmit}
            initialValues={props.pathInitialValues}
          />) ||
          <Button color='link' onClick={props.handleShowPathInput}>
            change derivation path
          </Button>
        }
      </div>
    </div>
  </div>
)

export default HWAddressSelectView
