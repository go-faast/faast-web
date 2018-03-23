import ReactHighcharts from 'react-highcharts'
import ReactHighstock from 'react-highcharts/ReactHighstock'
import { styleVars, themeColor } from 'Utilities/style'

const globalConfig = {
  chart: {
    backgroundColor: 'transparent',
    style: {
      fontFamily: styleVars.fontFamilyBase
    },
    plotBorderWidth: 0
  },
  credits: {
    style: {
      color: '#666'
    }
  },
  exporting: {
    enabled: false
  },
  labels: {
    style: {
      color: '#707073'
    }
  },
  legend: {
    itemStyle: {
      color: '#E0E0E3'
    },
    itemHoverStyle: {
      color: '#FFF'
    },
    itemHiddenStyle: {
      color: '#606063'
    }
  },
  loading: {
    labelStyle: {
      color: '#FFF'
    },
    style: {
      backgroundColor: '#707073'
    }
  },
  navigation: {
    buttonOptions: {
      symbolStroke: '#DDDDDD',
      theme: {
        fill: '#505053'
      }
    }
  },
  tooltip: {
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    style: {
      color: styleVars.textColor,
    }
  }
}

ReactHighstock.Highcharts.setOptions(globalConfig)
ReactHighcharts.Highcharts.setOptions(globalConfig)

export const pieChart = {
  colors: ['#0AA16F', '#0dd590', '#0EF0A1', '#0dd3b9', '#0B9986', '#076A5D'],
  chart: {
    type: 'pie'
  },
  title: null,
  tooltip: {
    pointFormat: '{series.name}: <b>{point.percentage:.2f}%</b>'
  },
  plotOptions: {
    pie: {
      allowPointSelect: true,
      borderColor: null,
      cursor: 'pointer',
      dataLabels: {
        enabled: true,
        format: '<b>{point.name}</b>',
        style: {
          color: 'white'
        },
        connectorColor: 'silver'
      }
    }
  }
}

export const priceChart = {
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
  yAxis: {
    min: 0,
    opposite: false,
    gridLineColor: '#707073',
    title: {
      style: {
        color: themeColor.primary
      }
    },
    labels: {
      y: null, // Center vertically
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

export default { priceChart, pieChart }
