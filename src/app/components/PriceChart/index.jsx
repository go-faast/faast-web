import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import ReactHighstock from 'react-highcharts/ReactHighstock.src'
import log from 'Utilities/log'
import toastr from 'Utilities/toastrWrapper'
import { getPriceChart } from 'Actions/request'
import config from 'Config'
import { getCurrentPortfolio } from 'Selectors'

const priceChartConfig = Object.assign({}, config.highCharts.priceChart, {
  series: [{
    name: 'USD',
    data: [],
    type: 'area',
    tooltip: {
      valueDecimals: 2
    },
    threshold: null
  }]
})
priceChartConfig.chart.height = 350

class PriceChart extends Component {
  componentDidUpdate (prevProps) {
    const symbol = this.props.symbol
    if (!prevProps.chartOpen && this.props.chartOpen) {
      const priceChart = this.refs[`priceChart_${symbol}`].getChart()
      priceChart.showLoading()
      this.props.getPriceChart(symbol)
      .then((data) => {
        priceChart.hideLoading()
        priceChart.series[0].setData(data)
      })
      .catch(e => {
        log.error(e)
        toastr.error(`Error getting price chart data for ${symbol}`)
      })
    }
  }

  render () {
    return <ReactHighstock config={priceChartConfig} ref={`priceChart_${this.props.symbol}`} />
  }
}

PriceChart.propTypes = {
  portfolio: PropTypes.object.isRequired,
  getPriceChart: PropTypes.func.isRequired,
  symbol: PropTypes.string.isRequired,
  chartOpen: PropTypes.bool
}

const mapStateToProps = (state) => ({
  portfolio: getCurrentPortfolio(state)
})

const mapDispatchToProps = (dispatch) => ({
  getPriceChart: (symbol) => {
    return dispatch(getPriceChart(symbol))
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(PriceChart)
