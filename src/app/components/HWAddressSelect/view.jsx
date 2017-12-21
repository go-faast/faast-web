import React from 'react'
import display from 'Utilities/display'
import DerivationPathForm from 'Components/DerivationPathForm'
import styles from './style'

const HWAddressSelectView = (props) => (
  <div className={styles.container}>
    <div>
      <div className='text-small text-medium-grey text-center'>Select the address to use</div>
      <form className={`form-check margin-bottom-10 ${styles.form}`}>
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
                  <div>{display.units(a.balance, 'ETH', 1)}</div>) ||
                  <div className='faast-loading loading-small margin-top-10 pull-right' />
                }
              </div>
            </div>
          ))}
        </div>
      </form>
      <div>
        <div className='row'>
          <div className='col-md-4 text-gradient cursor-pointer' onClick={props.handleDecreaseIxGroup}>previous</div>
          <div className='col-md-4'>showing indexes {props.startIndex} - {props.endIndex}</div>
          <div className='col-md-4 text-gradient cursor-pointer' onClick={props.handleIncreaseIxGroup}>next</div>
        </div>
      </div>
    </div>
    <div className='form-group'>
      <div className='button-primary cursor-pointer' onClick={props.handleAddressSubmit}><span className='text-small'>confirm</span></div>
      <div className='margin-top-10'>
        {(props.showPathInput &&
          <DerivationPathForm
            onSubmit={props.handlePathSubmit}
            initialValues={props.pathInitialValues}
          />) ||
          <div onClick={props.handleShowPathInput} className='text-gradient cursor-pointer'>
            change derivation path
          </div>
        }
      </div>
    </div>
  </div>
)

export default HWAddressSelectView
