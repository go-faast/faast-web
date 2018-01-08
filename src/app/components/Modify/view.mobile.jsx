import React from 'react'
import accounting from 'accounting'
import { RIENumber } from 'riek'
import Slider from '../Slider/index'
import display from 'Utilities/display'
import styles from './style.mobile.scss'
import config from 'Config'

const renderAssetRowsMobile = (props) => {
  const inputs = {
    fiat: {},
    weight: {}
  }

  return props.list.map((asset, i) => {
    const changeIconDirection = asset.priceDecrease ? 'down-icon' : 'up-icon'
    return (
      <div key={i} className='tile-container padding-left-20 margin-top-10' style={{ position: 'relative' }}>
        <div onClick={() => props.handleRemove(i)} className='tile-new'>remove</div>
        <div className='row'>
          <div className='col-md-4'>
            <div className='row'>
              <div className='col'>
                <div className='coin-icon pull-left' style={{ backgroundImage: `url(${config.siteUrl}/img/coins/coin_${asset.symbol}.png)` }} />
                <div className='pull-left text-medium'>{asset.name}</div>
              </div>
            </div>
            <div className='row margin-top-20'>
                <div className={`row ${styles.changesHeader}`}>
                  <div className={styles.arrow}>
                    <div className={`change-icon ${changeIconDirection}`} />
                  </div>
                  <div className={styles.dayChange}>
                    <div className='text-small text-medium-grey'>24h change</div>
                    <div className='text-medium text-white text-left'>{display.percentage(asset.change24, true)}</div>
                  </div>
                  <div className={styles.currentPrice}>
                    <div className='text-small text-medium-grey'>current price (USD)</div>
                    <div className='text-medium text-white text-right'>{display.fiat(asset.price)}</div>
                  </div>
              </div>
            </div>
          </div>
          <div className='col-md-1' />
          <div className='col-md-6'>
            <div className='status-data-container'>
              <div className='row'>
                <div className={styles.beforeAfter}>
                  <div className={styles.before}>
                    <div className={styles.difference}>Before</div>
                    <div className='status-table-label'>Value ($)</div>
                    <div className='status-table-value'>{display.fiat(asset.fiat.original)}</div>
                    <div className='status-table-label'>Weight (%)</div>
                    <div className='status-table-value'>{display.percentage(asset.weight.original)}</div>
                    <div className='status-table-label'>Units</div>
                    <div className='status-table-value'>
                      {display.units(asset.units.original, asset.symbol, asset.price)}
                    </div>
                  </div>
                  <div className={styles.after}>
                    <div className={styles.difference}>After</div>
                    <div className='status-table-label'>Value ($)</div>
                    <div className='status-table-value'>
                      <RIENumber
                        value={accounting.toFixed(asset.fiat.adjusted, 2)}
                        format={display.fiat}
                        change={props.handleFiatChange}
                        propName={asset.symbol}
                        className={styles.editable}
                        classEditing={styles.editableEditing}
                        ref={(input) => { inputs.fiat[asset.symbol] = input }}
                      />
                      <i onClick={() => inputs.fiat[asset.symbol].startEditing()} className='fa fa-pencil margin-left-5 text-gradient cursor-pointer' aria-hidden='true' />
                    </div>

                    <div className='status-table-label'>Weight (%)</div>
                      <div className='status-table-value'>
                        <RIENumber
                          value={accounting.toFixed(asset.weight.adjusted, 2)}
                          format={display.percentage}
                          change={props.handleWeightChange}
                          propName={asset.symbol}
                          className={styles.editable}
                          classEditing={styles.editableEditing}
                          ref={(input) => { inputs.weight[asset.symbol] = input }}
                        />
                        <i onClick={() => inputs.weight[asset.symbol].startEditing()} className='fa fa-pencil margin-left-5 text-gradient cursor-pointer' aria-hidden='true' />
                      </div>
                      <div className='status-table-label'>Units</div>
                      <div className='status-table-value'>
                        {display.units(asset.units.adjusted, asset.symbol, asset.price)}
                      </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className='row margin-top-10 padding-top-10 padding-bottom-10'>
          <div className='col'>
            <Slider
              asset={asset}
              {...props.sliderProps}
            />
          </div>
        </div>
      </div>
    )
  })
}

module.exports = {
  renderAssetRowsMobile
}
