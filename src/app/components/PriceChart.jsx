import React, { Component } from 'react'
import PropTypes from 'prop-types'
import ReactHighstock from 'react-highcharts/ReactHighstock.src'
import log from 'Utilities/log'
import toastr from 'Utilities/toastrWrapper'
import Faast from 'Services/Faast'
import config from 'Config'
import { merge } from 'lodash'

const priceSeriesName = 'Price (USD)'

const priceChartConfig = merge({}, config.highCharts.priceChart, {
  chart: {
    height: 350,
  },
  yAxis: {
    labels: {
      format: '${value}'
    },
    title: {
      text: priceSeriesName
    }
  },
  series: [{
    name: priceSeriesName,
    data: [],
    type: 'area',
    tooltip: {
      valuePrefix: '$',
      pointFormat: '<b>{point.y}</b> USD',
      valueDecimals: 2
    },
    threshold: null
  }]
})

class PriceChart extends Component {
  componentDidUpdate (prevProps) {
    const symbol = this.props.symbol
    if (!prevProps.chartOpen && this.props.chartOpen) {
      Faast.fetchPriceChart(symbol)
        .then((data) => {
          const priceChart = this.refs[`priceChart_${symbol}`].getChart()
          priceChart.showLoading()
          priceChart.series[0].setData(data)
          priceChart.hideLoading()
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
  symbol: PropTypes.string.isRequired,
  chartOpen: PropTypes.bool
}

export default PriceChart
