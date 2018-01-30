export const getCurrentPortfolio = ({ portfolio, portfolios }) => portfolios[portfolio.current]
export const getCurrentWallet = (state) => ((getCurrentPortfolio(state) || {}).wallets || [])[0] || {}