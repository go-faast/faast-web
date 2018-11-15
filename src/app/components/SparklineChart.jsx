import React from 'react'
import PropTypes from 'prop-types'
import { compose, setDisplayName, setPropTypes, lifecycle, defaultProps, withProps } from 'recompose'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import { getPriceChartData } from 'Selectors'
import { fetchPriceChartData } from 'Actions/priceChart'
import ReactHighstock from 'react-highcharts/ReactHighstock.src'
import { themeColor } from 'Utilities/style'

const SparklineChart = ({ config }) => {
  return <ReactHighstock config={config}/>
}

const initialConfig = {
  chart: {
    width: 120,
    height: 60,
    skipClone: true,
    type: 'area'
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
      lineWidth: 1,
      states: {
        hover: {
          lineWidth: 2
        }
      },
      threshold: null
    }
  },
  rangeSelector: {
    enabled: true,
    selected: 0,
    height: 0,
    buttons: [{
      type: 'month',
      count: 3,
      text: '3m'
    }],
    buttonTheme: {
      fill: '#505053',
      stroke: '#000000',
      style: {
        color: '#CCC',
        display: 'none'
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
      color: 'silver',
      display: 'none',
    },
    labelStyle: {
      color: 'silver',
      display: 'none'
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
      fontSize: '20px',
      display: 'none'
    }
  },
  xAxis: {
    gridLineColor: 'transparent',
    labels: {
      enabled: false,
      style: {
        color: '#E0E0E3'
      }
    },
    lineColor: 'transparent',
    minorGridLineColor: 'transparent',
    tickColor: 'transparent'
  },
  series: [{
    name: '',
    data: [],
    type: 'area',
    tooltip: {
      valuePrefix: '$',
      pointFormat: '<b>{point.y}</b> USD',
      valueDecimals: 2
    },
    threshold: null
  }],
  legend: {
    enabled: false
  },
  yAxis: {
    min: 0,
    opposite: false,
    gridLineColor: 'transparent',
    title: {
      text: '',
      style: {
        color: themeColor.primary
      }
    },
    labels: {
      enabled: false,
      y: null, // Center vertically
      format: '${value}',
      align: 'right',
      style: {
        color: themeColor.primary,
        fontSize: '12px'
      }
    },
    lineColor: 'transparent',
    minorGridLineColor: 'transparent',
    tickColor: 'transparent',
    tickWidth: 1,
    plotLines: [{
      value: 0,
      width: 1,
      color: 'transparent'
    }]
  }
}

export default compose(
  setDisplayName('SparklineChart'),
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
)(SparklineChart)
