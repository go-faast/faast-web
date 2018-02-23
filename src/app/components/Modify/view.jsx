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
import { Row, Col, Card, CardHeader, CardBody, ListGroup, ListGroupItem } from 'reactstrap'
import WalletSummary from 'Components/WalletSummary'
import Button from 'Components/Button'

const ModifyView = (props) => {
  const { portfolio, handleCancel, handleSave } = props

  const renderAssetRows = (assetHoldings) => assetHoldings.map((a) => {
    const changeIconDirection = a.priceDecrease ? 'down-icon' : 'up-icon'
    const { walletId, symbol, name, change24, price, units, fiat, weight } = a
    const fiatPrice = display.fiat(price)
    const percentChange24 = display.percentage(change24, true)
    const originalFiat = display.fiat(fiat.original)
    const originalWeight = display.percentage(a.weight.original)
    const originalUnits = (<Units value={units.original} symbol={symbol} precision={6}/>)
    const adjustedFiat = accounting.toFixed(fiat.adjusted, 2)
    const adjustedWeight = accounting.toFixed(weight.adjusted, 2)
    const adjustedUnits = (<Units value={units.adjusted} symbol={symbol} precision={6}/>)

    let fiatInput
    let weightInput

    return (
      <ListGroupItem key={symbol}>
        <Row className='medium-gutters-x align-items-center'>
          <Col xs lg='4' xl='5' className='order-1'>
            <Row className='medium-gutters align-items-center'>
              <Col xs='3' md='2' lg='auto' className='text-center text-md-right'>
                <div className='coin-icon mx-auto mr-md-0' style={{ backgroundImage: `url(${config.siteUrl}/img/coins/coin_${symbol}.png)` }} />
              </Col>
              <Col xs='auto'><h5 className='m-0'>{name}</h5></Col>
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
          <Col xs='12' lg style={{ lineHeight: 1 }} className='order-3 order-lg-2'>
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
                        change={(change) => props.handleFiatChange(walletId, symbol, change[symbol])}
                        propName={symbol}
                        className={styles.editable}
                        classEditing={styles.editableEditing}
                        ref={(input) => { fiatInput = input }}
                      />
                      <i onClick={() => fiatInput.startEditing()} className='fa fa-pencil margin-left-5 text-gradient cursor-pointer' aria-hidden='true' />
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
                        change={(change) => props.handleWeightChange(walletId, symbol, change[symbol])}
                        propName={symbol}
                        className={styles.editable}
                        classEditing={styles.editableEditing}
                        ref={(input) => { weightInput = input }}
                      />
                      <i onClick={() => weightInput.startEditing()} className='fa fa-pencil margin-left-5 text-gradient cursor-pointer' aria-hidden='true' />
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
          <Col xs='auto' className='align-self-start order-2 order-lg-3'>
            <Button small onClick={() => props.handleRemove(walletId, symbol)}>remove</Button>
          </Col>
        </Row>
        
        <div className='pt-3'>
          <Slider
            asset={a}
            walletId={walletId}
            {...props.sliderProps}
          />
        </div>
      </ListGroupItem>
    )
  })

  const renderHoldings = (wallets) => wallets
    .map(({ id, label, assetHoldings }) => (
      <Col xs='12' key={id}>
        <Card>
          <CardHeader><h4 className='m-0'>{label}</h4></CardHeader>
          <ListGroup>
            {renderAssetRows(assetHoldings.filter(({ shown }) => shown))}
            <ListGroupItem action onClick={props.handleAssetListShow} tag='button' className='text-center'>
              <span className={styles.addNew} />
              <span className='text-gradient ml-3 h5 align-middle'>add asset</span>
            </ListGroupItem>
          </ListGroup>
        </Card>
      </Col>
    ))

  return (
    <Layout {...props.layoutProps}>
      {props.showAssetList &&
        <AssetList {...props.assetListProps} className='gradient-background' />
      }
      <SignTxModal showModal={props.showSignTxModal} toggleModal={props.handleToggleSignTxModal} />
      <Sticky innerZ={config.sticky.zIndex} top='#header'>
        <div className={headerStyles.header}>
          <Row className='medium-gutters'>
            <Col xs='12' md='6' lg='4'>
              <Card tag={CardBody} className='h-100 justify-content-center'>
                <WalletSummary wallet={portfolio}/>
              </Card>
            </Col>
            <Col xs='12' md='6' lg='4' className='text-center'>
              <Card tag={CardBody} className='h-100 justify-content-center'>
                <div className='text-small text-medium-grey'>available to swap</div>
                <div className='text-medium text-white'>{display.fiat(props.allowance.fiat)} / {display.percentage(props.allowance.weight)}</div>
              </Card>
            </Col>
            <Col xs='12' md='6' lg='4'>
              <Card tag={CardBody} className='h-100'>
                <Row className='medium-gutters'>
                  <Col xs='6'>
                    <Button outline onClick={handleCancel} className='w-100'>cancel</Button>
                  </Col>
                  <Col xs='6'>
                    <Button onClick={handleSave} className='w-100'>save</Button>
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>
        </div>
      </Sticky>
      <div className={styles.modifyAssetList}>
        <Row className='no-gutters-x medium-gutters-y'>
          {renderHoldings(portfolio.nestedWallets)}
        </Row>
      </div>
    </Layout>
  )
}

export default ModifyView
