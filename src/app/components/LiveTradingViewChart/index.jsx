import React from 'react'
import { compose, setDisplayName, lifecycle, withHandlers, defaultProps } from 'recompose'
import style from './style.scss'
import Datafeed from './api/'


const INTERVAL = {
  MINUTE: '1',
  MINUTES_5: '5',
  MINUTES_15: '15',
  MINUTES_30: '30',
  HOUR: '60',
  HOURS_3: '180',
  HOURS_6: '360',
  HOURS_12: '720',
  DAY: 'D',
  WEEK: 'W',
}

const TIME_FRAMES = [
  { text: '3y', resolution: INTERVAL.WEEK, description: '3 Years' },
  { text: '1y', resolution: INTERVAL.DAY, description: '1 Year' },
  { text: '3m', resolution: INTERVAL.HOURS_12, description: '3 Months' },
  { text: '1m', resolution: INTERVAL.HOURS_6, description: '1 Month' },
  { text: '7d', resolution: INTERVAL.HOUR, description: '7 Days' },
  { text: '3d', resolution: INTERVAL.MINUTES_30, description: '3 Days' },
  { text: '1d', resolution: INTERVAL.MINUTES_15, description: '1 Day' },
  { text: '6h', resolution: INTERVAL.MINUTES_5, description: '6 Hours' },
  { text: '1h', resolution: INTERVAL.MINUTE, description: '1 Hour' },
]

export const TVChartContainer = ({ containerId }) => {
  return (
    <div 
      id={containerId}
      className={style.TVChartContainer}
    />
  )
}

export default compose(
  setDisplayName('TVChartContainer'),
  defaultProps({
    symbol: 'BTC',
    interval: '5',
    containerId: 'tv-chart',
    libraryPath: `/${(location.hostname === 'localhost' || location.hostname === '127.0.0.1') && 'app/'}static/vendor/charting_library/`,
    chartsStorageUrl: 'https://saveload.tradingview.com',
    chartsStorageApiVersion: '1.1',
    clientId: 'tradingview.com',
    userId: 'public_user_id',
    fullscreen: false,
    autosize: true,
    studiesOverrides: {},
    theme: 'Dark'
  }),
  withHandlers({
    handleMakeChart: ({ symbol, interval, containerId, libraryPath, chartsStorageUrl,
      chartsStorageApiVersion, clientId, userId, fullscreen, autosize, theme, studiesOverrides }) => () => {
      const widgetOptions = {
        debug: false,
        symbol: `${symbol}/USD`,
        datafeed: Datafeed,
        interval: interval,
        toolbar_bg: '#212121',
        container_id: containerId,
        library_path: libraryPath,
        locale: 'en',
        disabled_features: ['use_localstorage_for_settings'],
        enabled_features: ['hide_left_toolbar_by_default'],
        disabledDrawings: true,
        charts_storage_url: chartsStorageUrl,
        charts_storage_api_version: chartsStorageApiVersion,
        client_id: clientId,
        user_id: userId,
        change_symbol: false,
        fullscreen: fullscreen,
        time_frames:TIME_FRAMES,
        autosize: autosize,
        theme: theme,
        studies_overrides: studiesOverrides,
        overrides: {
          'mainSeriesProperties.showCountdown': false,
          'paneProperties.background': '#212121',
          'paneProperties.gridProperties.color': '#fff',
          'paneProperties.vertGridProperties.color': '#333',
          'paneProperties.horzGridProperties.color': '#333',
          'scalesProperties.backgroundColor' : '#212121',
          'scalesProperties.textColor': '#fff'
        },
        favorites: {
          intervals: ['1D', '3D', '3W', 'W', 'M'],
        }
      }
      const widget = window.tvWidget = new window.TradingView.widget(widgetOptions)
  
      window.TradingView.onready(() => {
        widget.onChartReady(() => {
          console.log('on chart ready')
        })
      })
    }
  }),
  lifecycle({
    componentDidMount() {
      const { handleMakeChart } = this.props
      handleMakeChart()
    },
    componentDidUpdate(prevProps) {
      const { symbol, handleMakeChart } = this.props
      if (symbol !== prevProps.symbol) {
        setTimeout(handleMakeChart, 500)
      }
    }
  })
)(TVChartContainer)