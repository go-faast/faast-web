import PropTypes from 'prop-types'
import { compose, setDisplayName, setPropTypes, withProps } from 'recompose'
import { Link } from 'react-router-dom'

import config from 'Config'

import AccessTile from './AccessTile'

export default compose(
  setDisplayName('HardwareWalletAccessTile'),
  setPropTypes({
    type: PropTypes.oneOf(Object.keys(config.walletTypes)).isRequired,
  }),
  withProps(({ type }) => {
    const { name, icon, supportedAssets } = config.walletTypes[type]
    return ({
      name,
      icon,
      assets: Object.keys(supportedAssets),
      tag: Link,
      to: `/connect/hw/${type}`,
      color: 'primary',
      outline: true,
    })
  }),
)(AccessTile)
      