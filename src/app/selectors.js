export const isAppReady = ({ app }) => app.ready
export const getAppError = ({ app }) => app.error

export const getAllPortfolios = ({ portfolios }) => portfolios
export const getCurrentPortfolio = ({ portfolio, portfolios }) => portfolios[portfolio.current]

export const getAllWallets = ({ wallets }) => wallets
export const getCurrentWallet = (state) => state.wallets[(getCurrentPortfolio(state) || {}).id] || {}