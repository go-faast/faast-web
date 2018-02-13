const baseConfig = {
  chart: {
    backgroundColor: 'rgba(255, 255, 255, 0)',
    style: {
      fontFamily: '\'Unica One\', sans-serif'
    },
    plotBorderColor: '#606063'
  },
  colors: ['#0AA16F', '#0dd590', '#0EF0A1', '#0dd3b9', '#0B9986', '#076A5D'],
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
      color: '#F0F0F0'
    }
  }
}

export default {
  pieChart: Object.assign({}, baseConfig, {
    chart: Object.assign({}, baseConfig.chart, {
      type: 'pie'
    }),
    title: null,
    tooltip: Object.assign({}, baseConfig.tooltip, {
      pointFormat: '{series.name}: <b>{point.percentage:.2f}%</b>'
    }),
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
  }),
  priceChart: Object.assign({}, baseConfig, {
    navigator: {
      enabled: false
    },
    plotOptions: {
      series: {
        dataLabels: {
          color: '#B0B0B3'
        },
        marker: {
          lineColor: '#333'
        }
      },
      boxplot: {
        fillColor: '#505053'
      },
      candlestick: {
        lineColor: 'white'
      },
      errorbar: {
        color: 'white'
      },
      area: {
        fillColor: {
          linearGradient: {
            x1: 0,
            y1: 0,
            x2: 0,
            y2: 1
          },
          stops: [
            [0, '#0dd590'],
            [1, '#0dd3b9']
          ]
        },
        marker: {
          radius: 2
        },
        lineWidth: 1,
        states: {
          hover: {
            lineWidth: 1
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
    // title: null,
    title: {
      align: 'left',
      useHTML: true,
      text: '',
      style: {
        color: '#E0E0E3',
        // textTransform: 'uppercase',
        fontSize: '20px'
      }
    },
    // tooltip: {
    //   backgroundColor: 'rgba(0, 0, 0, 0.85)',
    //   style: {
    //     color: '#F0F0F0'
    //   }
    // },
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
      // title: {
      //   text: 'Time',
      //   style: {
      //     color: '#A0A0A3'
      //
      //   }
      // }
    },
    yAxis: {
      min: 0,
      opposite: false,
      gridLineColor: '#707073',
      labels: {
        align: 'right',
        style: {
          color: '#E0E0E3'
        },
        formatter: function () {
          return '$' + this.value
        }
      },
      lineColor: '#707073',
      minorGridLineColor: '#505053',
      tickColor: '#707073',
      tickWidth: 1,
      // title: {
      //   text: 'Price ETH / USD',
      //   style: {
      //     color: '#A0A0A3'
      //   }
      // },
      plotLines: [{
        value: 0,
        width: 1,
        color: '#808080'
      }]
    }
  })
}
