import React from 'react'
import PropTypes from 'prop-types'
import { compose, setDisplayName, setPropTypes, withProps, withHandlers } from 'recompose'
import { Button } from 'reactstrap'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import { omit } from 'lodash'

import { changeDerivationPath } from 'Actions/connectHardwareWallet'
import { getDerivationPath } from 'Selectors/connectHardwareWallet'

const extraPropTypes = {
  segwitPrefix: PropTypes.string,
  lagacyPrefix: PropTypes.string,
}

export default compose(
  setDisplayName('ToggleSegwitButton'),
  setPropTypes({
    ...Button.propTypes,
    ...extraPropTypes,
  }),
  withProps((props) => ({
    buttonProps: omit(props, Object.keys(extraPropTypes)),
  })),
  connect(createStructuredSelector({
    derivationPath: getDerivationPath
  }), {
    changeDerivationPath,
  }),
  withProps(({ derivationPath, segwitPrefix, legacyPrefix }) => {
    const isSegwit = derivationPath.startsWith(segwitPrefix)
    const isLegacy = derivationPath.startsWith(legacyPrefix)
    return {
      isSegwit,
      canSwitch: typeof derivationPath === 'string' && (isSegwit || isLegacy)
    }
  }),
  withHandlers({
    handleClick: ({ derivationPath, segwitPrefix, legacyPrefix, changeDerivationPath, isSegwit, canSwitch }) => () => {
      if (!canSwitch) {
        return
      }
      const newPath = isSegwit
        ? derivationPath.replace(segwitPrefix, legacyPrefix)
        : derivationPath.replace(legacyPrefix, segwitPrefix)
      changeDerivationPath(newPath)
    }
  })
)(({ isSegwit, canSwitch, handleClick, buttonProps }) => canSwitch && (
  <Button color='dark' onClick={handleClick} {...buttonProps}>
    {isSegwit 
      ? 'Switch to legacy (non-segwit) account'
      : 'Switch to segwit account'}
  </Button>
))
