import React from 'react'
import PropTypes from 'prop-types'
import { compose, setDisplayName, setPropTypes, withProps, withHandlers, branch, renderNothing } from 'recompose'
import { Button } from 'reactstrap'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import { omit } from 'lodash'

import config from 'Config'
import { changeDerivationPath } from 'Actions/connectHardwareWallet'
import { getDerivationPath } from 'Selectors/connectHardwareWallet'

const extraPropTypes = {
  walletType: PropTypes.string.isRequired,
  assetSymbol: PropTypes.string.isRequired,
}

export default compose(
  setDisplayName('SwitchPathButton'),
  setPropTypes({
    ...Button.propTypes,
    ...extraPropTypes,
  }),
  withProps((props) => ({
    ...((((config.walletTypes[props.walletType] || {}).supportedAssets || {})[props.assetSymbol] || {}).switchPath || {}),
    buttonProps: omit(props, Object.keys(extraPropTypes)),
  })),
  branch(
    ({ primaryPrefix, secondaryPrefix }) => !(primaryPrefix || secondaryPrefix),
    renderNothing),
  connect(createStructuredSelector({
    derivationPath: getDerivationPath
  }), {
    changeDerivationPath,
  }),
  withProps(({ derivationPath, primaryPrefix, secondaryPrefix }) => {
    const isPrimary = derivationPath.startsWith(primaryPrefix)
    const isSecondary = derivationPath.startsWith(secondaryPrefix)
    return {
      isPrimary,
      canSwitch: typeof derivationPath === 'string' && (isPrimary || isSecondary)
    }
  }),
  withHandlers({
    handleClick: ({ derivationPath, primaryPrefix, secondaryPrefix, changeDerivationPath, isPrimary, canSwitch }) => () => {
      if (!canSwitch) {
        return
      }
      const newPath = isPrimary
        ? derivationPath.replace(primaryPrefix, secondaryPrefix)
        : derivationPath.replace(secondaryPrefix, primaryPrefix)
      changeDerivationPath(newPath)
    }
  })
)(({ isPrimary, primaryLabel, secondaryLabel, canSwitch, handleClick, buttonProps }) => canSwitch && (
  <Button color='dark' onClick={handleClick} {...buttonProps}>
    Switch to {isPrimary 
      ? (secondaryLabel || 'secondary account')
      : (primaryLabel || 'primary account')}
  </Button>
))
