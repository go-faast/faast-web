import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import ReactHighcharts from 'react-highcharts'
import config from 'Config'

let prevAssetIx

class PieChartController extends Component {
  constructor () {
    super()
    this._setPieChartSeries = this._setPieChartSeries.bind(this)
  }

  componentDidUpdate (prevProps) {
    if (prevProps.chartSelect.symbol !== this.props.chartSelect.symbol) {
      window.setTimeout(() => {
        const list = this.props.portfolio.list
        const assetIx = list.findIndex(a => a.symbol === this.props.chartSelect.symbol)
        const pieChart = this.refs.pieChart.getChart()
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

  _setPieChartSeries () {
    const list = this.props.portfolio.list.filter(a => a.shown)
    let seriesData
    if (list.length === 1) {
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
    return Object.assign({}, config.highCharts.pieChart, {
      plotOptions: Object.assign({}, config.highCharts.pieChart.plotOptions, {
        pie: Object.assign({}, config.highCharts.pieChart.plotOptions.pie, {
          events: {
            click: (e) => {
              const point = e.point || {}
              this.props.handleChartSelect(point.name)
            }
          }
        })
      }),
      series: [{
        name: 'Weight',
        data: seriesData
      }]
    })
  }

  render () {
    return <ReactHighcharts config={this._setPieChartSeries()} ref='pieChart' />
  }
}

PieChartController.propTypes = {
  portfolio: PropTypes.object.isRequired,
  chartSelect: PropTypes.object.isRequired,
  handleChartSelect: PropTypes.func.isRequired
}

const mapStateToProps = (state) => ({
  portfolio: state.portfolio
})

export default connect(mapStateToProps)(PieChartController)
