import React from 'react'
import PropTypes from 'prop-types'
import { compose, setDisplayName, setPropTypes, defaultProps, withProps } from 'recompose'
import QRCode from 'qrcode.react'
import { omit, pick } from 'lodash'
import classNames from 'class-names'

import { numberish } from 'Utilities/propTypes'

import style from './style.scss'

const qrCodePropTypes = omit(QRCode.propTypes, 'value', 'className')

export default compose(
  setDisplayName('DepositQRCode'),
  setPropTypes({
    address: PropTypes.string.isRequired,
    asset: PropTypes.object,
    amount: numberish,
    scan: PropTypes.bool,
    qrClass: PropTypes.string,
    ...qrCodePropTypes,
  }),
  defaultProps({
    scan: false,
  }),
  withProps(({ address, asset: { bip21Prefix } = {}, amount, qrClass, ...props }) => {
    const withProtocol = bip21Prefix && address.indexOf(bip21Prefix) < 0 
      ? `${bip21Prefix}:${address}` : address
    const fullUri = !amount || bip21Prefix === 'ethereum' ? withProtocol : `${withProtocol}?amount=${amount}`
    return {
      fullUri,
      qrProps: {
        ...pick(props, Object.keys(qrCodePropTypes)),
        className: qrClass,
      },
    }
  })
)(({ className, scan, fullUri, qrProps }) => (
  <div className={classNames(className, style.wrapper, { [style.wrapperScan]: scan })}>
    {scan && (<div className={style.scan}></div>)}
    <a href={fullUri}>
      <QRCode level='L' value={fullUri} {...qrProps} />
    </a>
  </div>
))
