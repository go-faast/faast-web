import React from 'react'
import PropTypes from 'prop-types'
import { Collapse } from 'reactstrap'
import display from 'Utilities/display'
import styles from './style.mobile.scss'
import config from 'Config'
import PriceChart from 'Components/PriceChart'

const renderAssetsMobile = (props) => {
  return props.assetRows.map((a, i) => (
    <div key={i}>
      <div onClick={() => props.toggleChart(a.symbol)} className={`row ${styles.tableRow}`}>
        <div className={`col-md-2 text-white ${styles.tableCell}`}>
          <div className={styles.tableCoinIcon} style={{ backgroundImage: `url(${config.siteUrl}/img/coins/coin_${a.symbol}.png)` }} />
            <div className={styles.tableCoinName}>{a.name}</div>
        </div>
        <div className={`col-md-2 text-white ${styles.tableCell}`}>
          <div className={styles.unitTitles}>Units:</div>
          <div className={styles.balanceValues}>
            {display.units(a.units, a.symbol, a.price)}
          </div>
        </div>
        <div className={`col-md-2 text-white ${styles.tableCell}`}>
          <div className={styles.unitTitles}>Portfolio weight:</div>
          <div className={styles.balanceValues}>
            {display.percentage(a.weight)}
          </div>
        </div>
        <div className={`col-md-2 text-white ${styles.tableCell}`}>
          <div className={styles.unitTitles}>Portfolio value(USD):</div>
          <div className={styles.balanceValues}>
            {display.fiat(a.value)}
          </div>
        </div>
        <div className={`col-md-2 text-white ${styles.tableCell}`}>
          <div className={styles.unitTitles}>Price (USD):</div>
          <div className={styles.balanceValues}>
            {display.fiat(a.price)}
          </div>
        </div>
        <div className={`col-md-2 text-white ${styles.tableCell}`}>
            <div className={styles.unitTitles}>24h change (USD):</div>
            <div className={styles.balanceValues}>
              {display.percentage(a.change, true)}
            </div>
            <div className={styles.tableChangeValue}>

          </div>
          <div className={a.priceDecrease ? styles.tableChangeDownIcon : styles.tableChangeUpIcon} />
        </div>
      </div>
      <Collapse isOpen={a.chartOpen}>
        <div className={styles.areaChartContainer}>
          <div className={styles.tileChart}>
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
            <PriceChart symbol={a.symbol} chartOpen={a.chartOpen} />
          </div>
        </div>
      </Collapse>
    </div>
  ))
}

module.exports = {
  renderAssetsMobile
}
