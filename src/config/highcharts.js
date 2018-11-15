import ReactHighcharts from 'react-highcharts'
import ReactHighstock from 'react-highcharts/ReactHighstock'
import * as styleVars from 'faast-ui/src/style/variables'

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
      allowPointSelect: false,
      borderColor: null,
      cursor: 'default',
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

export default { pieChart }
