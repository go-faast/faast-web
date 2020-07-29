import React, { Component } from 'react'
import PropTypes from 'prop-types'
import ReactHighcharts from 'react-highcharts'
import config from 'Config'

import { withTranslation } from 'react-i18next'

let prevAssetIx

class PieChart extends Component {
  constructor () {
    super()
    this._setPieChartSeries = this._setPieChartSeries.bind(this)
    this.chartRef = React.createRef()
  }

  componentDidUpdate (prevProps) {
    if (prevProps.selectedSymbol !== this.props.selectedSymbol) {
      window.setTimeout(() => {
        const list = this.props.portfolio.assetHoldings
        const assetIx = list.findIndex(a => a.symbol === this.props.selectedSymbol)
        const pieChart = this.chartRef.getChart()
        if (typeof prevAssetIx !== 'undefined' && pieChart.series[0].data[prevAssetIx]) {
          pieChart.series[0].data[prevAssetIx].slice(false)
        }
        if (pieChart.series[0].data[assetIx]) {
          pieChart.series[0].data[assetIx].slice(true)
          prevAssetIx = assetIx
        }
      }, 1)
    }
  }

  _setPieChartSeries (t) {
    const { portfolio, handleChartSelect } = this.props
    const list = portfolio.assetHoldings.filter(a => a.shown)
    const noBalance = portfolio.totalFiat.toNumber() === 0
    let seriesData
    if (noBalance) {
      seriesData = [{
        name: '',
        y: 100,
        sliced: true
      }]
    } else if (list.length === 1) {
      seriesData = [{
        name: list[0].symbol,
        y: 100,
        sliced: true
      }]
    } else {
      seriesData = list.map((a, i) => ({
        name: a.symbol,
        y: a.percentage.toNumber(),
        sliced: i === prevAssetIx
      }))
    }
    const { pieChart } = config.highCharts
    return Object.assign({}, pieChart, {
      plotOptions: Object.assign({}, pieChart.plotOptions, {
        pie: Object.assign({}, pieChart.plotOptions.pie, {
          events: {
            click: (e) => {
              const point = e.point || {}
              handleChartSelect && handleChartSelect(point.name)
            }
          }
        })
      }),
      series: [{
        name: t('app.pieChart.weight', 'Weight'),
        data: seriesData
      }]
    })
  }

  render () {
    const { t } = this.props
    return <ReactHighcharts config={this._setPieChartSeries(t)} ref={this.chartRef} />
  }
}

PieChart.propTypes = {
  portfolio: PropTypes.object.isRequired,
  selectedSymbol: PropTypes.string,
  handleChartSelect: PropTypes.func
}

export default withTranslation()(PieChart)
