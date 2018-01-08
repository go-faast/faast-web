import React from 'react'
import PropTypes from 'prop-types'
import { Collapse } from 'reactstrap'
import BigNumber from 'bignumber.js'
import Layout from 'Components/Layout'
import Address from 'Components/Address'
import PriceChart from 'Components/PriceChart'
import SignTxModal from 'Components/SignTxModal'
import Welcome from 'Components/Welcome'
import display from 'Utilities/display'
import styles from './style'
import config from 'Config'
import { renderAssetsMobile } from './view.mobile'

const OrderInProgress = (props) => {
  const statusIcon = () => {
    switch (props.status) {
    case 'working':
      return <div className='faast-loading loading-medium margin-top-30 margin-left-10' />
    case 'complete':
      return <div className='margin-top-30 margin-left-10' />
    case 'error':
      return <div className='margin-top-30 margin-left-10' />
    }
  }
  const statusTitle = () => {
    switch (props.status) {
    case 'working':
      return 'orders in progress'
    case 'complete':
      return 'orders complete'
    case 'error':
      return 'orders done with errors'
    }
  }
  const statusContent = () => {
    switch (props.status) {
    case 'working':
      return 'The orders placed with respect to your previous transaction is still in progress. You cannot modify your portfolio until your previous orders have been fulfilled.'
    case 'complete':
      return 'The orders have completed successfully. It may take a short amount of time to see the adjusted balances reflected in your portfolio.'
    case 'error':
      return 'There was an issue with one or more of your orders. Select "view status" for more details.'
    }
  }
  return (
    <div className='row padding-0 margin-top-30'>
      <div className='col tile-container'>
        <div onClick={props.handleViewStatus} className='tile-new' style={{ zIndex: 10 }}>view status</div>
        <div className='row'>
          <div className='col-md-3'>
            {statusIcon()}
          </div>
          <div className='col-md-6'>
            <div className='text-medium text-gradient'>
              {statusTitle()}
            </div>
            <div className='text-small text-medium-grey'>
              {statusContent()}
            </div>
          </div>
          <div className='col-md-3' />
        </div>
      </div>
    </div>
  )
}

const BalancesView = (props) => {
  const {
    mq: { isMobile }, totalChange, totalDecrease, total24hAgo, total, assetRows, viewOnly, orderStatus, addressProps, pieChart,
    toggleChart, layoutProps, showOrderModal, handleToggleOrderModal
  } = props

  const values = [
    {
      title: '24h change',
      value: display.percentage(totalChange, true),
      changeIcon: totalDecrease ? styles.changeDownIcon : styles.changeUpIcon
    },
    {
      title: '24h ago (USD)',
      value: display.fiat(total24hAgo)
    },
    {
      title: 'current (USD)',
      value: display.fiat(total)
    },
    {
      title: 'number of assets',
      value: assetRows.length
    }
  ]
  const renderStats = () => {
    return values.map(({ title, value, changeIcon }, i) => (
      <div key={i} className={`col-md-3 ${styles.tileOuterContainer}`}>
        <div className={styles.tileContainer}>
          <div className='row'>
            {!!changeIcon &&
              <div className='col-sm-3'>
                <div className={changeIcon} />
              </div>
            }
            <div className={changeIcon ? 'col-sm-9' : 'col'}>
              <div className={styles.statsTitle}>{title}</div>
              <div className={`text-white ${styles.statsContent}`}>{value}</div>
            </div>
          </div>
        </div>
      </div>
    ))
  }

  const renderStatsPhone = () => {
    return values.map(({ title, value, changeIcon }, i) => (
      <div key={i} className={styles.tileContainerPhone}>
          {!!changeIcon &&
            <div className='col-sm-3'>
              <div className={changeIcon} />
            </div>
          }
          <div className={changeIcon ? 'col-sm-9' : 'col'}>
            <div className={styles.statsTitle}>{title}</div>
            <div className={`text-white ${styles.statsContent}`}>{value}</div>
          </div>
      </div>
    ))
  }

  const renderAssets = () => {
    return assetRows.map(({ symbol, name, units, price, weight, value, change, priceDecrease, chartOpen, infoUrl }, i) => (
      <div key={i}>
        <div onClick={() => toggleChart(symbol)} className={`row ${styles.tableRow}`}>
          <div className={`col-md-2 text-white ${styles.tableCell}`}>
            <div className={styles.tableCoinIcon} style={{ backgroundImage: `url(${config.siteUrl}/img/coins/coin_${symbol}.png)` }} />
            <div className={styles.tableCoinName}>{name}</div>
          </div>
          <div className={`col-md-2 text-white ${styles.tableCell}`}>
            {display.units(units, symbol, price)}
          </div>
          <div className={`col-md-2 text-white ${styles.tableCell}`}>{display.percentage(weight)}</div>
          <div className={`col-md-2 text-white ${styles.tableCell}`}>{display.fiat(value)}</div>
          <div className={`col-md-2 text-white ${styles.tableCell}`}>{display.fiat(price)}</div>
          <div className={`col-md-2 text-white ${styles.tableCell}`}>
            <div className={styles.tableChangeValue}>{display.percentage(change, true)}</div>
            <div className={priceDecrease ? styles.tableChangeDownIcon : styles.tableChangeUpIcon} />
          </div>
        </div>
        <Collapse isOpen={chartOpen}>
          <div className={styles.areaChartContainer}>
            <div className={styles.tileContainer}>
              <div className='row'>
                <div className='col-md-8'>
                  <div className={styles.assetTitle}>
                    <strong>{name}</strong> ({symbol})
                    <span><i className='fa fa-external-link text-gradient margin-left-10' /> <a className={styles.link} href={infoUrl} target='_blank' rel='noopener'>info</a></span>
                  </div>
                </div>
                <div className='col-md-4 text-right'>
                  {/* <span className='link'>send</span> | <span className='link'>receive</span> */}
                </div>
              </div>
              <PriceChart symbol={symbol} chartOpen={chartOpen} />
            </div>
          </div>
        </Collapse>
      </div>
    ))
  }

  return (
    <Layout {...layoutProps}>
      {viewOnly &&
        <div className='col-md-12 margin-top-40'>
          <div className={`text-center ${styles.viewMode}`}>
            You are in VIEW MODE. If this is your address, you will need to access the wallet before you can trade assets.
          </div>
        </div>
      }
      {!viewOnly &&
        <SignTxModal showModal={showOrderModal} toggleModal={handleToggleOrderModal} view='orderStatus' />
      }
      {!viewOnly &&
        <Welcome />
      }
      {!viewOnly && !!orderStatus &&
        <OrderInProgress status={orderStatus} handleViewStatus={handleToggleOrderModal} />
      }
      <div className={`row ${styles.statsContainer}`}>
        {!isMobile &&
          renderStats()
        }
        {isMobile &&
          <div className={`col-md-3 ${styles.tileOuterContainerPhone}`}>
            {renderStatsPhone()}
          </div>
        }
      </div>

      { !isMobile && //different chart and address for tablet and up
        <div className={`row ${styles.chartContainer}`}>

        <div className={`col ${styles.tileOuterContainer}`}>
          <div className={styles.tileContainer}>
            <div style={{ textAlign: 'right' }}>
              <div className={styles.addressTitle}>address</div>
              {(viewOnly && addressProps.address) ||
                <Address tablet={!isMobile} className={styles.link} {...addressProps} />
              }
            </div>
            {pieChart}
          </div>
        </div>
      </div>
      }
      { isMobile &&
        <div className={`row ${styles.chartContainer}`}>
          <div className={`col ${styles.tileOuterContainer}`}>
            <div className={styles.tileContainerAddress}>
              <div style={{ textAlign: 'right' }}>
                <Address className={styles.link} {...addressProps} />
              </div>
            </div>
            {pieChart}
          </div>
        </div>
      }
      { !isMobile &&
        <div className={`row ${styles.tableHeader}`}>
          <div className={`col-md-2 text-left ${styles.columnTitle}`}>Asset name</div>
          <div className={`col-md-2 ${styles.columnTitle}`}>Units</div>
          <div className={`col-md-2 ${styles.columnTitle}`}>Portfolio weight</div>
          <div className={`col-md-2 ${styles.columnTitle}`}>Portfolio value (USD)</div>
          <div className={`col-md-2 ${styles.columnTitle}`}>Price (USD)</div>
          <div className={`col-md-2 text-right ${styles.columnTitle}`}>24h change</div>
        </div>
      }
      <div className={`row ${styles.gradientSeparator}`} />
      {!isMobile &&
        renderAssets()
      }
      {isMobile &&
        renderAssetsMobile(props)
      }
    </Layout>
  )
}

BalancesView.propTypes = {
  totalChange: PropTypes.instanceOf(BigNumber),
  totalDecrease: PropTypes.bool,
  total24hAgo: PropTypes.instanceOf(BigNumber),
  total: PropTypes.instanceOf(BigNumber),
  assetRows: PropTypes.array,
  toggleChart: PropTypes.func,
  layoutProps: PropTypes.object,
  pieChart: PropTypes.element
}

export default BalancesView
