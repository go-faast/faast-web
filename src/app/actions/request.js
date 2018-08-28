import Faast from 'Services/Faast'

export const getPriceChart = (symbol) => () => Faast.fetchPriceChart(symbol)
