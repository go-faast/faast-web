import React from 'react'
import { compose, setDisplayName, withProps } from 'recompose'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import { getSwapChartData, isSwapChartLoading } from 'Selectors/affiliate'
import ReactHighcharts from 'react-highcharts'
import { themeColor } from 'Utilities/style'

const priceSeriesName = 'Swaps per day'

const StatsChart = ({ config, isSwapChartLoading }) => {
  return isSwapChartLoading ? 
    <i className='fa fa-spinner fa-pulse'/> : (<ReactHighcharts config={config}/>)
}

const initialConfig = {
  chart: {
    type:'column',
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
      valuePrefix: '',
      pointFormat: '# of swaps: <b>{point.y}</b>',
      valueDecimals: 2
    },
    threshold: null
  }],
  yAxis: {
    dateTimeLabelFormats: {
      day: '%e. %b',
    },
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
      format: '{value}',
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
  setDisplayName('StatsChart'),
  connect(createStructuredSelector({
    data: getSwapChartData,
    isSwapChartLoading,
  }), {
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
)(StatsChart)
