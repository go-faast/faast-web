import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { compose, setDisplayName, setPropTypes, lifecycle, defaultProps, withState, withHandlers } from 'recompose'
import { connect } from 'react-redux'
import ReactHighstock from 'react-highcharts/ReactHighstock.src'
import { themeColor } from 'Utilities/style'
import log from 'Utilities/log'
import toastr from 'Utilities/toastrWrapper'
import { fetchPriceChart } from 'Services/Faast'

const priceSeriesName = 'Price (USD)'

const PriceChart = ({ config, symbol }) => {
  var chartConfig = priceChartConfig
  if (config[symbol]) {
    chartConfig = config[symbol]
  }
  return <ReactHighstock config={chartConfig} />
}

const priceChartConfig = {
  chart: {
    height: 350,
  },
  colors: [themeColor.primary],
  navigator: {
    enabled: false
  },
  tooltip: {
    followPointer: true
  },
  plotOptions: {
    area: {
      dataLabels: {
        color: '#B0B0B3'
      },
      fillOpacity: 0.75,
      marker: {
        radius: 2,
        fillColor: themeColor.ultraDark,
      },
      lineWidth: 2,
      states: {
        hover: {
          lineWidth: 2
        }
      },
      threshold: null
    }
  },
  rangeSelector: {
    buttonTheme: {
      fill: '#505053',
      stroke: '#000000',
      style: {
        color: '#CCC'
      },
      states: {
        hover: {
          fill: '#707073',
          stroke: '#000000',
          style: {
            color: 'white'
          }
        },
        select: {
          fill: '#000003',
          stroke: '#000000',
          style: {
            color: 'white'
          }
        }
      }
    },
    inputBoxBorderColor: '#505053',
    inputStyle: {
      backgroundColor: '#333',
      color: 'silver'
    },
    labelStyle: {
      color: 'silver'
    }
  },
  scrollbar: {
    enabled: false
  },
  title: {
    align: 'left',
    useHTML: true,
    text: '',
    style: {
      color: '#E0E0E3',
      fontSize: '20px'
    }
  },
  xAxis: {
    gridLineColor: '#707073',
    labels: {
      style: {
        color: '#E0E0E3'
      }
    },
    lineColor: '#707073',
    minorGridLineColor: '#505053',
    tickColor: '#707073'
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
  }],
  yAxis: {
    min: 0,
    opposite: false,
    gridLineColor: '#707073',
    title: {
      text: priceSeriesName,
      style: {
        color: themeColor.primary
      }
    },
    labels: {
      y: null, // Center vertically
      format: '${value}',
      align: 'right',
      style: {
        color: themeColor.primary,
        fontSize: '12px'
      }
    },
    lineColor: '#707073',
    minorGridLineColor: '#505053',
    tickColor: '#707073',
    tickWidth: 1,
    plotLines: [{
      value: 0,
      width: 1,
      color: '#808080'
    }]
  }
}

export default compose(
  setDisplayName('PriceChart'),
  withState('config', 'updateConfig', {}),
  withHandlers({
    updatePriceData: ({ config, updateConfig }) => (data, symbol) => {
      console.log('config in handler1', config)
      config[symbol] = priceChartConfig
      config[symbol].series[0].data = data
      console.log('config in handler2', config)
      updateConfig(config)
    }
  }),
  setPropTypes({
    symbol: PropTypes.string.isRequired,
    chartOpen: PropTypes.bool
  }),
  defaultProps({
    chartOpen: false
  }),
  lifecycle({
    componentDidUpdate (prevProps) {
      const { symbol, chartOpen, updatePriceData } = this.props
      if (!prevProps.chartOpen && chartOpen) {
        fetchPriceChart(symbol)
          .then((data) => {
            updatePriceData(data, symbol)
          })
          .catch(e => {
            log.error(e)
            toastr.error(`Error getting price chart data for ${symbol}`)
          })
      }
    }
  }),
)(PriceChart)
