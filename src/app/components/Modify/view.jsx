import React from 'react'
import Sticky from 'react-stickynode'
import accounting from 'accounting'
import { RIENumber } from 'riek'
import Layout from 'Components/Layout'
import Slider from 'Components/Slider'
import AssetList from 'Components/AssetList'
import SignTxModal from 'Components/SignTxModal'
import display from 'Utilities/display'
import styles from './style'
import config from 'Config'
import { breakpointNext } from 'Utilities/breakpoints'
import { Row, Col } from 'reactstrap'

const ModifyView = (props) => {
  const inputs = {
    fiat: {},
    weight: {}
  }

  const { collapseTablePoint } = styles
  const expandTablePoint = breakpointNext(collapseTablePoint)

  const TableCell = ({ className, children, ...extraProps }) => (
    <Col
      {...({ xs: '6', [expandTablePoint]: '12', ...extraProps })}
      className={`d-none d-${expandTablePoint}-block`}>
      {children}
    </Col>
  )

  const { mq: { isMobile } } = props

  const renderAssetRows = () => {
    return props.list.map((a, i) => {
      const changeIconDirection = a.priceDecrease ? 'down-icon' : 'up-icon'
      const { symbol, name, change24, price} = a
      const originalFiat = display.fiat(a.fiat.original)
      const fiatPrice = display.fiat(price)
      const percentChange24 = display.percentage(change24, true)

      return (
        <div key={i} className='col-12'>
          <div className='tile-container padding-left-20'>
            <Row className='gutters'>
              <Col {...({ xs: '6', [expandTablePoint]: '12' })}>
                <div onClick={() => props.handleRemove(i)} className='tile-new'>remove</div>
              </Col>
              <Col>
                <div className='coin-icon pull-left' style={{ backgroundImage: `url(${config.siteUrl}/img/coins/coin_${symbol}.png)` }} />
                <div className='pull-left text-medium'>{name}</div>
              </Col>
              <Col {...({ xs: '3', [expandTablePoint]: '2' })}>
                <div className={styles.greyStatus}>Status</div>
              </Col>
              <Col {...({ xs: '3', [expandTablePoint]: '1' })}>
                <div className={styles.greyStatus}>Value ($)</div>
              </Col>
              <Col {...({ xs: '3', [expandTablePoint]: '1' })}>
                <div className={styles.greyStatus}>Weight (%)</div>
              </Col>
              <Col {...({ xs: '3', [expandTablePoint]: '2' })}>
                <div className={styles.greyStatus}>Units</div>
              </Col>
            </Row>
            <Row className="gutters">
              <Col {...({ xs: '3', [expandTablePoint]: 'auto' })}>
                <div className={`change-icon ${changeIconDirection}`} />
              </Col>
              <Col {...({ xs: '3', [expandTablePoint]: 'auto' })}>
                <div className='text-small text-medium-grey'>24h change</div>
                <div className='text-medium text-white'>{percentChange24}</div>
              </Col>
              <Col {...({ xs: '3', [expandTablePoint]: '3' })}>
                <div className='text-small text-medium-grey'>current price (USD)</div>
                <div className='text-medium text-white'>{fiatPrice}</div>
              </Col>

            <Col {...({ xs: '3', [expandTablePoint]: '2' })}>
              <div className='status-table-value'>Before</div>
              <div className='status-table-value'>After</div>
            </Col>
            <Col {...({ xs: '3', [expandTablePoint]: '2' })}>
              <div className='status-table-value'>{originalFiat}</div>
                <div className='status-data-container'>
                  <div className='status-table-value'>
                    <RIENumber
                      value={accounting.toFixed(a.fiat.adjusted, 2)}
                      format={display.fiat}
                      change={props.handleFiatChange}
                      propName={a.symbol}
                      className={styles.editable}
                      classEditing={styles.editableEditing}
                      ref={(input) => { inputs.fiat[a.symbol] = input }}
                    />
                    <i onClick={() => inputs.fiat[a.symbol].startEditing()} className='fa fa-pencil margin-left-5 text-gradient cursor-pointer' aria-hidden='true' />
                  </div>
                </div>
            </Col>
            <Col {...({ xs: '3', [expandTablePoint]: '2' })}>
              <div className='status-table-value'>{originalFiat}</div>
                <div className='status-data-container'>
                  <div className='status-table-value'>
                    <RIENumber
                      value={accounting.toFixed(a.weight.adjusted, 2)}
                      format={display.percentage}
                      change={props.handleWeightChange}
                      propName={a.symbol}
                      className={styles.editable}
                      classEditing={styles.editableEditing}
                      ref={(input) => { inputs.weight[a.symbol] = input }}
                    />
                  <i onClick={() => inputs.weight[a.symbol].startEditing()} className='fa fa-pencil margin-left-5 text-gradient cursor-pointer' aria-hidden='true' />
                  </div>
                </div>
            </Col>
            <Col {...({ xs: '3', [expandTablePoint]: '1' })}>
              <div className='status-table-value'>
                {display.units(a.units.original, symbol, price)}
              </div>
            </Col>
          </Row>
          <div className='row margin-top-20 padding-top-20 padding-bottom-20'>
            <div className='col'>
              <Slider
                asset={a}
                {...props.sliderProps}
              />
            </div>
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
        <div className={`row medium-gutters ${styles.header}`}>
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
      </Sticky>
      <div className={styles.modifyAssetList}>
        <div className='row medium-gutters'>
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
