import React from 'react'
import Sticky from 'react-stickynode'
import accounting from 'accounting'
import { RIENumber } from 'riek'
import LayoutController from 'Controllers/LayoutController'
import SliderController from 'Controllers/SliderController'
import AssetListController from 'Controllers/AssetListController'
import SignTxModalController from 'Controllers/SignTxModalController'
import display from 'Utilities/display'
import styles from 'Styles/Modify.scss'
import config from 'Config'

const Modify = (props) => {
  const inputs = {
    fiat: {},
    weight: {}
  }

  let mq = props.mq
  let tablet = mq.sm

  const renderAssetRows = () => {
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
                <div className='col-6'>
                  <div className='row'>
                    <div className='col-sm-3'>
                      <div className={`change-icon ${changeIconDirection}`} />
                    </div>
                    <div className='col-sm-9'>
                      <div className='text-small text-medium-grey'>24h change</div>
                      <div className='text-medium text-white'>{display.percentage(asset.change24, true)}</div>
                    </div>
                  </div>
                </div>
                <div className='col-6'>
                  <div className='row'>
                    <div className='col'>
                      <div className='text-small text-medium-grey'>current price (USD)</div>
                      <div className='text-medium text-white'>{display.fiat(asset.price)}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className='col-md-1' />
            <div className='col-md-6'>
              <div className='status-data-container'>
                <div className='row'>
                  {tablet&&
                    <div className='col-md-3'>
                      <div className='status-table-label'>Status</div>
                      <div className='status-table-value'>Before</div>
                      <div className='status-table-value'>After</div>
                    </div>
                  }
                  <div className='col-md-3'>
                    <div className='status-table-label'>Value ($)</div>
                    <div className='status-table-value'>{display.fiat(asset.fiat.original)}</div>
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
                  </div>
                  <div className='col-md-3 active'>
                    <div className='status-table-label'>Weight (%)</div>
                    <div className='status-table-value'>{display.percentage(asset.weight.original)}</div>
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
                  </div>
                  <div className='col-md-3'>
                    <div className='status-table-label'>Units</div>
                    <div className='status-table-value'>
                      {display.units(asset.units.original, asset.symbol, asset.price)}
                    </div>
                    <div className='status-table-value'>
                      {display.units(asset.units.adjusted, asset.symbol, asset.price)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className='row margin-top-20 padding-top-20 padding-bottom-20'>
            <div className='col'>
              <SliderController
                asset={asset}
                {...props.sliderProps}
              />
            </div>
          </div>
        </div>
      )
    })
  }

  let tile = tablet? 'tile-container' : `${styles.tileContainer}`
  let addTile = tablet? 'tile-container' : `${styles.addTile}`
  let addAsset = tablet? 'add a new asset' : 'add asset'

  return (
    <LayoutController {...props.layoutProps}>
      {props.showAssetList &&
        <AssetListController {...props.assetListProps} className='gradient-background' />
      }
      <SignTxModalController showModal={props.showSignTxModal} toggleModal={props.handleToggleSignTxModal} />
      <Sticky innerZ={config.sticky.zIndex} top='#header'>
        <div className={`row stats-container ${styles.header}`}>
          <div className='col-md-4 tile-outer-container'>
            <div className={tile}>
              <div className='row'>
                <div className='col'>
                  <div className='text-small text-medium-grey'>available to swap</div>
                  <div className='text-medium text-white'>{display.fiat(props.allowance.fiat)} / {display.percentage(props.allowance.weight)}</div>
                </div>
              </div>
            </div>
          </div>
          <div className='col-md-8 tile-outer-container'>
            <div className={addTile}>
              <div className='row'>
                <div className='col'>
                  {tablet &&
                    <div className='text-medium-grey text-small'>
                      add a new asset from the unallocated value
                    </div>
                  }
                  <div onClick={props.handleAssetListShow} className='text-gradient text-medium cursor-pointer'>
                    <i className='fa fa-plus text-gradient' aria-hidden='true' /> {addAsset}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Sticky>
      <div className='row margin-bottom-20 margin-top-10'>
        <div className='col padding-0'>
          <div className='modify-asset-list-container'>
            {renderAssetRows()}
            <div onClick={props.handleAssetListShow} className='tile-container tile-border cursor-pointer margin-top-10'>
              <div className='margin-top-30 add-new' />
              <div className='text-center text-gradient'>add asset</div>
            </div>
          </div>
        </div>
      </div>
    </LayoutController>
  )
}

export default Modify
