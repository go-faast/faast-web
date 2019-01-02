import React from 'react'
import { isEmpty } from 'lodash'
import { compose, setDisplayName, withProps } from 'recompose'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import { swapPieChartData } from 'Selectors'
import ReactHighcharts from 'react-highcharts'
import config from 'Config'

import { text } from '../style'

const PieChart = ({ config, data }) => {
  return isEmpty(data) ? (
    <div className='d-flex align-items-center justify-content-center'>
      <p className={text}>No swaps created yet.</p>
    </div>
  ) : (
    <ReactHighcharts config={config}/>
  )
}

const { pieChart: initialConfig } = config.highCharts

export default compose(
  setDisplayName('PieChart'),
  connect(createStructuredSelector({
    data: swapPieChartData
  }), {
  }),
  withProps(({ data }) => {
    const config = Object.assign({}, initialConfig, {
      series: [{
        name: '# of Swaps',
        data: data
      }],
      tooltip: {
        pointFormat: '{series.name}: <b>{point.y}</b>'
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
              color: '#525252'
            },
            connectorColor: 'silver'
          }
        }
      }
    })
    return { config }
  })
)(PieChart)