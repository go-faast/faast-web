import React from 'react'
import PropTypes from 'prop-types'
import { Collapse } from 'reactstrap'
import BigNumber from 'bignumber.js'
import LayoutController from 'Controllers/LayoutController'
import AddressController from 'Controllers/AddressController'
import PriceChartController from 'Controllers/PriceChartController'
import SignTxModalController from 'Controllers/SignTxModalController'
import WelcomeController from 'Controllers/WelcomeController'
import display from 'Utilities/display'
import styles from 'Styles/Balances.scss'
import config from 'Config'

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
      <div className={`col tile-container`}>
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

const Balances = (props) => {
  const values = [
    {
      title: '24h change',
      value: display.percentage(props.totalChange, true),
      changeIcon: props.totalDecrease ? styles.changeDownIcon : styles.changeUpIcon
    },
    {
      title: '24h ago (USD)',
      value: display.fiat(props.total24hAgo)
    },
    {
      title: 'current (USD)',
      value: display.fiat(props.total)
    },
    {
      title: 'number of assets',
      value: props.assetRows.length
    }
  ]
  const renderStats = () => {
    return values.map((a, i) => (
      <div key={i} className={`col-md-3 ${styles.tileOuterContainer}`}>
        <div className={styles.tileContainer}>
          <div className='row'>
            {!!a.changeIcon &&
              <div className='col-sm-3'>
                <div className={a.changeIcon} />
              </div>
            }
            <div className={a.changeIcon ? 'col-sm-9' : 'col'}>
              <div className={styles.statsTitle}>{a.title}</div>
              <div className={`text-white ${styles.statsContent}`}>{a.value}</div>
            </div>
          </div>
        </div>
      </div>
    ))
  }

  const renderAssets = () => {
    console.log(props)
    return props.assetRows.map((a, i) => (
      <div key={i}>
        <div onClick={() => props.toggleChart(a.symbol)} className={`row ${styles.tableRow}`}>
          <div className={`col-md-2 text-white ${styles.tableCell}`}>
            <div className={styles.tableCoinIcon} style={{ backgroundImage: `url(${config.siteUrl}/img/coins/coin_${a.symbol}.png)` }} />
            <div className={styles.tableCoinName}>{a.name}</div>
          </div>
          <div className={`col-md-2 text-white ${styles.tableCell}`}>
            {display.units(a.units, a.symbol, a.price)}
          </div>
          <div className={`col-md-2 text-white ${styles.tableCell}`}>{display.percentage(a.weight)}</div>
          <div className={`col-md-2 text-white ${styles.tableCell}`}>{display.fiat(a.value)}</div>
          <div className={`col-md-2 text-white ${styles.tableCell}`}>{display.fiat(a.price)}</div>
          <div className={`col-md-2 text-white ${styles.tableCell}`}>
            <div className={styles.tableChangeValue}>{display.percentage(a.change, true)}</div>
            <div className={a.priceDecrease ? styles.tableChangeDownIcon : styles.tableChangeUpIcon} />
          </div>
        </div>
        <Collapse isOpen={a.chartOpen}>
          <div className={styles.areaChartContainer}>
            <div className={styles.tileContainer}>
              <div className='row'>
                <div className='col-md-8'>
                  <div className={styles.assetTitle}>
                    <strong>{a.name}</strong> ({a.symbol})
                    <span><i className='fa fa-external-link text-gradient margin-left-10' /> <a className={styles.link} href={a.infoUrl} target='_blank' rel='noopener'>info</a></span>
                  </div>
                </div>
                <div className='col-md-4 text-right'>
                  {/* <span className='link'>send</span> | <span className='link'>receive</span> */}
                </div>
              </div>
              <PriceChartController symbol={a.symbol} chartOpen={a.chartOpen} />
            </div>
          </div>
        </Collapse>
      </div>
    ))
  }

  return (
    <LayoutController {...props.layoutProps}>
      {props.viewOnly &&
        <div className='col-md-12 margin-top-40'>
          <div className={`text-center ${styles.viewMode}`}>
            You are in VIEW MODE. If this is your address, you will need to access the wallet before you can trade assets.
          </div>
        </div>
      }
      {!props.viewOnly &&
        <SignTxModalController showModal={props.showOrderModal} toggleModal={props.handleToggleOrderModal} view='orderStatus' />
      }
      {!props.viewOnly &&
        <WelcomeController />
      }
      {!props.viewOnly && !!props.orderStatus &&
        <OrderInProgress status={props.orderStatus} handleViewStatus={props.handleToggleOrderModal} />
      }
      <div className={`row ${styles.statsContainer}`}>
        {renderStats()}
      </div>
      <div className={`row ${styles.chartContainer}`}>
        <div className={`col ${styles.tileOuterContainer}`}>
          <div className={styles.tileContainerAddress}>
            <div style={{ textAlign: 'right' }}>
              <div className={styles.addressTitle}>address</div>
                <AddressController className={styles.link} {...props.addressProps} />
            </div>
          </div>
          {props.pieChart}
        </div>
      </div>
      <div className={`row ${styles.tableHeader}`}>
        <div className={`col-md-2 text-left ${styles.columnTitle}`}>Asset name</div>
        <div className={`col-md-2 ${styles.columnTitle}`}>Units</div>
        <div className={`col-md-2 ${styles.columnTitle}`}>Portfolio weight</div>
        <div className={`col-md-2 ${styles.columnTitle}`}>Portfolio value (USD)</div>
        <div className={`col-md-2 ${styles.columnTitle}`}>Price (USD)</div>
        <div className={`col-md-2 text-right ${styles.columnTitle}`}>24h change</div>
      </div>
      <div className={`row ${styles.gradientSeparator}`} />
      {renderAssets()}
    </LayoutController>
  )
}

Balances.propTypes = {
  totalChange: PropTypes.instanceOf(BigNumber),
  totalDecrease: PropTypes.bool,
  total24hAgo: PropTypes.instanceOf(BigNumber),
  total: PropTypes.instanceOf(BigNumber),
  assetRows: PropTypes.array,
  toggleChart: PropTypes.func,
  layoutProps: PropTypes.object,
  pieChart: PropTypes.element
}

export default Balances
