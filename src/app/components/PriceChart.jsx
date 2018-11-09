import React from 'react'
import PropTypes from 'prop-types'
import { compose, setDisplayName, setPropTypes, lifecycle, defaultProps, withProps } from 'recompose'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import { getPriceChartData } from 'Selectors'
import { fetchPriceChartData } from 'Actions/priceChart'
import ReactHighstock from 'react-highcharts/ReactHighstock.src'
import { themeColor } from 'Utilities/style'

const priceSeriesName = 'Price (USD)'

const PriceChart = ({ config }) => {
  return <ReactHighstock config={config}/>
}

const initialConfig = {
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
  connect(createStructuredSelector({
    data: (state, { symbol }) => getPriceChartData(state, symbol)
  }), {
    fetchPriceChart: fetchPriceChartData
  }),
  setPropTypes({
    symbol: PropTypes.string.isRequired,
    chartOpen: PropTypes.bool,
    toggle: PropTypes.bool
  }),
  defaultProps({
    chartOpen: false,
    toggle: false
  }),
  withProps(({ data }) => {
    const config = (data 
      ? {
        ...initialConfig,
        series: [{
          ...initialConfig.series[0],
          data: data
        }]
      } 
      : initialConfig)
    return { config }
  }),
  lifecycle({
    componentDidUpdate (prevProps) {
      const { symbol, chartOpen, fetchPriceChart, toggle } = this.props
      if (!prevProps.chartOpen && chartOpen || !toggle && chartOpen) {
        fetchPriceChart(symbol)
      }
    },
    componentWillMount() {
      const { symbol, chartOpen, fetchPriceChart, toggle } = this.props
      if (!toggle && chartOpen) {
        fetchPriceChart(symbol)
      }
    }
  }),
)(PriceChart)
