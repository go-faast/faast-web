import React from 'react'
import Sticky from 'react-stickynode'
import accounting from 'accounting'
import { RIENumber } from 'riek'
import Layout from 'Components/Layout'
import Slider from 'Components/Slider'
import AssetList from 'Components/AssetList'
import SignTxModal from 'Components/SignTxModal'
import Units from 'Components/Units'
import display from 'Utilities/display'
import styles from './style'
import headerStyles from 'Components/Header/style'
import config from 'Config'
import { Row, Col } from 'reactstrap'

const ModifyView = (props) => {
  const inputs = {
    fiat: {},
    weight: {}
  }

  const { mq: { isMobile } } = props

  const renderAssetRows = () => {
    return props.list.map((a) => {
      const changeIconDirection = a.priceDecrease ? 'down-icon' : 'up-icon'
      const { symbol, name, change24, price, units, fiat, weight } = a
      const fiatPrice = display.fiat(price)
      const percentChange24 = display.percentage(change24, true)
      const originalFiat = display.fiat(fiat.original)
      const originalWeight = display.percentage(a.weight.original)
      const originalUnits = (<Units value={units.original} symbol={symbol} maxPrecision={6}/>)
      const adjustedFiat = accounting.toFixed(fiat.adjusted, 2)
      const adjustedWeight = accounting.toFixed(weight.adjusted, 2)
      const adjustedUnits = (<Units value={units.adjusted} symbol={symbol} maxPrecision={6}/>)

      return (
        <div key={symbol} className='col-12'>
          <div className='tile-container'>
            <div onClick={() => props.handleRemove(symbol)} className='tile-new' style={{ top: '8px', right: '0' }}>remove</div>
            <Row className='medium-gutters-x align-items-center'>
              <Col xs='12' lg='4' xl='5'>
                <Row className='medium-gutters align-items-center'>
                  <Col xs='3' md='2' lg='auto' className='text-center text-md-right'>
                    <div className='coin-icon mx-auto mr-md-0' style={{ backgroundImage: `url(${config.siteUrl}/img/coins/coin_${symbol}.png)` }} />
                  </Col>
                  <Col xs='auto' className='text-medium'>{name}</Col>
                </Row>
                <Row className='medium-gutters-x my-3 align-items-center'>
                  <Col xs='3' md='2' lg='auto'>
                    <div className={`change-icon mx-auto mr-md-0 ${changeIconDirection}`} />
                  </Col>
                  <Col xs='4' md='3' lg>
                    <div className='text-small text-medium-grey'>24h change</div>
                    <div className='text-medium text-white'>{percentChange24}</div>
                  </Col>
                  <Col>
                    <div className='text-small text-medium-grey'>current price</div>
                    <div className='text-medium text-white'>{fiatPrice}</div>
                  </Col>
                </Row>
              </Col>
              <Col xs='12' lg='8' xl='7' style={{ lineHeight: 1 }}>
                <Row className='medium-gutters'>
                  <Col xs='12' md='2' lg='auto'>
                    <Row className='medium-gutters flex-md-column'>
                      <Col xs='3' md='12'>&nbsp;</Col>
                      <Col xs='4' md='12' className={`${styles.greyStatus} text-md-right`}>Before</Col>
                      <Col xs='5' md='12' className={`${styles.greyStatus} text-md-right`}>After</Col>
                    </Row>
                  </Col>
                  <Col xs='12' md='3' lg>
                    <Row className='medium-gutters flex-md-column'>
                      <Col xs='3' md='12' className={`${styles.greyStatus} text-right text-md-left`}>Value</Col>
                      <Col xs='4' md='12' className='status-table-value'>{originalFiat}</Col>
                      <Col xs='5' md='12' className='status-data-container'>
                        <div className='status-table-value'>
                          <RIENumber
                            value={adjustedFiat}
                            format={display.fiat}
                            change={props.handleFiatChange}
                            propName={a.symbol}
                            className={styles.editable}
                            classEditing={styles.editableEditing}
                            ref={(input) => { inputs.fiat[a.symbol] = input }}
                          />
                          <i onClick={() => inputs.fiat[a.symbol].startEditing()} className='fa fa-pencil margin-left-5 text-gradient cursor-pointer' aria-hidden='true' />
                        </div>
                      </Col>
                    </Row>
                  </Col>
                  <Col xs='12' md='3' lg>
                    <Row className="medium-gutters flex-md-column">
                      <Col xs='3' md='12' className={`${styles.greyStatus} text-right text-md-left`}>Weight</Col>
                      <Col xs='4' md='12' className='status-table-value'>{originalWeight}</Col>
                      <Col xs='5' md='12' className='status-data-container'>
                        <div className='status-table-value'>
                          <RIENumber
                            value={adjustedWeight}
                            format={display.percentage}
                            change={props.handleWeightChange}
                            propName={a.symbol}
                            className={styles.editable}
                            classEditing={styles.editableEditing}
                            ref={(input) => { inputs.weight[a.symbol] = input }}
                          />
                          <i onClick={() => inputs.weight[a.symbol].startEditing()} className='fa fa-pencil margin-left-5 text-gradient cursor-pointer' aria-hidden='true' />
                        </div>
                      </Col>
                    </Row>
                  </Col>
                  <Col xs='12' md>
                    <Row className="medium-gutters flex-md-column">
                      <Col xs='3' md='12' className={`${styles.greyStatus} text-right text-md-left`}>Units</Col>
                      <Col xs='4' md='12' className='status-table-value'>{originalUnits}</Col>
                      <Col xs='5' md='12' className='status-table-value'>{adjustedUnits}</Col>
                    </Row>
                  </Col>
                </Row>
              </Col>
            </Row>
            
          <div className='pt-3'>
            <Slider
              asset={a}
              {...props.sliderProps}
            />
          </div>
        </div>
      </div>
      )
    })
  }

  let tile = !isMobile ? 'tile-container' : `${styles.tileContainer}`
  let addAsset = !isMobile ? 'add a new asset' : 'add asset'

  return (
    <Layout {...props.layoutProps}>
      {props.showAssetList &&
        <AssetList {...props.assetListProps} className='gradient-background' />
      }
      <SignTxModal showModal={props.showSignTxModal} toggleModal={props.handleToggleSignTxModal} />
      <Sticky innerZ={config.sticky.zIndex} top='#header'>
        <div className={headerStyles.header}>
          <div className='row medium-gutters-x'>
            <div className='col-6 col-md-4 tile-outer-container'>
              <div className={tile}>
                <div className='text-small text-medium-grey'>available to swap</div>
                <div className='text-medium text-white'>{display.fiat(props.allowance.fiat)} / {display.percentage(props.allowance.weight)}</div>
              </div>
            </div>
            <div className='col-6 col-md-8 tile-outer-container'>
              <div className={tile}>
                {!isMobile &&
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
      </Sticky>
      <div className={styles.modifyAssetList}>
        <div className='row no-gutters-x medium-gutters-y'>
          {renderAssetRows()}
          <div className='col-12'>
            <div onClick={props.handleAssetListShow} className='tile-container tile-border cursor-pointer'>
              <div className='margin-top-30 add-new' />
              <div className='text-center text-gradient'>add asset</div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default ModifyView
