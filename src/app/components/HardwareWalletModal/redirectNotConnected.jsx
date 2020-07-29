import { compose } from 'recompose'
import { connect } from 'react-redux'

import routes from 'Routes'
import { getStatus, getWalletType, getAssetSymbol } from 'Selectors/connectHardwareWallet'

import conditionalRedirect from 'Hoc/conditionalRedirect'

export default compose(
  connect((state, { walletType, assetSymbol }) => ({
    status: status ? status : getStatus(state),
    walletType: walletType ? walletType : getWalletType(state),
    assetSymbol: assetSymbol ? assetSymbol : getAssetSymbol(state),
  }), null),
  conditionalRedirect(
    ({ walletType, assetSymbol }) => routes.connectHwWalletAsset(walletType, assetSymbol),
    ({ status }) => status !== 'connected')
)
