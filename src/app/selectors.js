export const isAppReady = ({ app }) => app.ready
export const getAppError = ({ app }) => app.error

export const getAllPortfolios = ({ portfolios }) => portfolios
export const getCurrentPortfolio = ({ portfolio, portfolios }) => portfolios[portfolio.current]

export const getAllWallets = ({ wallets }) => wallets
export const getWallet = (walletId) => (state) => getAllWallets(state)[walletId]
export const getCurrentWallet = (state) => getWallet((getCurrentPortfolio(state) || {}).id)(state) || {}
export const getPortfolioIdsForWallet = (walletId) => (state) =>
  Object.values(getAllPortfolios(state))
    .filter(({ wallets }) => wallets.includes(walletId))
    .map(({ id }) => id)