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
import { Row, Col, Card, CardHeader, ListGroup, ListGroupItem, Modal, Alert, Button } from 'reactstrap'
import WalletSummary from 'Components/WalletSummary'
import Overlay from 'Components/Overlay'
import { zIndexSticky } from 'faast-ui'
import ArrowIcon from 'Components/ArrowIcon'

const ModifyView = (props) => {
  const { portfolio, handleCancel, handleSave, disableSaveMessage } = props

  const renderAssetRows = (assetHoldings) => assetHoldings.map((a) => {
    const { walletId, symbol, name, change24, price, units, fiat, weight, swapEnabled, priceDecrease } = a
    const disabled = !swapEnabled
    const changeIconDirection = priceDecrease ? 'down' : 'up'
    const changeColor = priceDecrease ? 'danger' : 'success'
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
        {disabled && (
          <Overlay className='justify-content-end'>
            <Alert color='info' className='m-1'>
              Swapping {name} is currently unavailable
            </Alert>
          </Overlay>
        )}
        <Row className='gutter-x-3 align-items-center'>
          <Col xs lg='4' xl='5' className='order-1'>
            <Row className='gutter-3 align-items-center'>
              <Col xs='3' md='2' lg='auto' className='text-center text-md-right'>
                <div className='coin-icon mx-auto mr-md-0' style={{ backgroundImage: `url(${config.siteUrl}/img/coins/coin_${symbol}.png)` }} />
              </Col>
              <Col xs='auto'><h5 className='m-0'>{name}</h5></Col>
            </Row>
            <Row className='gutter-x-3 my-3 align-items-center'>
              <Col xs='3' md='2' lg='auto'>
                <ArrowIcon dir={changeIconDirection} size='md' color={changeColor} className='mx-auto mr-md-0' />
              </Col>
              <Col xs='4' md='3' lg>
                <div className='text-grey'>24h change</div>
                <div className={`text-medium text-${changeColor}`}>{percentChange24}</div>
              </Col>
              <Col>
                <div className='text-grey'>current price</div>
                <div className='text-medium text-white'>{fiatPrice}</div>
              </Col>
            </Row>
          </Col>
          <Col xs='12' lg style={{ lineHeight: 1 }} className='order-3 order-lg-2'>
            <Row className='gutter-3'>
              <Col xs='12' md='2' lg='auto'>
                <Row className='gutter-3 flex-md-column'>
                  <Col xs='3' md='12'>&nbsp;</Col>
                  <Col xs='4' md='12' className='text-grey text-md-right'>Before</Col>
                  <Col xs='5' md='12' className='text-grey text-md-right'>After</Col>
                </Row>
              </Col>
              <Col xs='12' md='3' lg>
                <Row className='gutter-3 flex-md-column'>
                  <Col xs='3' md='12' className='text-grey text-right text-md-left'>Value</Col>
                  <Col xs='4' md='12'>{originalFiat}</Col>
                  <Col xs='5' md='12'>
                    {disabled ? (
                      display.fiat(adjustedFiat)
                    ) : (
                      <span className='text-primary'>
                        <RIENumber
                          value={adjustedFiat}
                          format={display.fiat}
                          change={(change) => props.handleFiatChange(walletId, symbol, change[symbol])}
                          propName={symbol}
                          className='cursor-pointer'
                          classEditing={styles.editableEditing}
                          ref={(input) => { fiatInput = input }}
                        />
                        <i onClick={() => fiatInput.startEditing()} className='fa fa-pencil margin-left-5 cursor-pointer' aria-hidden='true' />
                      </span>
                    )}
                  </Col>
                </Row>
              </Col>
              <Col xs='12' md='3' lg>
                <Row className="gutter-3 flex-md-column">
                  <Col xs='3' md='12' className='text-grey text-right text-md-left'>Weight</Col>
                  <Col xs='4' md='12'>{originalWeight}</Col>
                  <Col xs='5' md='12'>
                    {disabled ? (
                      display.percentage(adjustedWeight)
                    ) : (
                      <span className='text-primary'>
                        <RIENumber
                          value={adjustedWeight}
                          format={display.percentage}
                          change={(change) => props.handleWeightChange(walletId, symbol, change[symbol])}
                          propName={symbol}
                          className='cursor-pointer'
                          classEditing={styles.editableEditing}
                          ref={(input) => { weightInput = input }}
                          disabled={disabled}
                        />
                        <i onClick={() => weightInput.startEditing()} className='fa fa-pencil margin-left-5 cursor-pointer' aria-hidden='true' />
                      </span>
                    )}
                  </Col>
                </Row>
              </Col>
              <Col xs='12' md>
                <Row className="gutter-3 flex-md-column">
                  <Col xs='3' md='12' className='text-grey text-right text-md-left'>Units</Col>
                  <Col xs='4' md='12'>{originalUnits}</Col>
                  <Col xs='5' md='12'>{adjustedUnits}</Col>
                </Row>
              </Col>
            </Row>
          </Col>
          <Col xs='auto' className='align-self-start order-2 order-lg-3'>
            <Button color='danger' size='sm' disabled={disabled} onClick={() => props.handleRemove(walletId, symbol)}>
              <i className='fa fa-times'/> remove
            </Button>
          </Col>
        </Row>
        
        <div className='pt-3'>
          <Slider
            asset={a}
            walletId={walletId}
            disabled={disabled}
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
          <CardHeader>
            <Row className='gutter-3 align-items-center'>
              <Col>
                <h4 className='m-0 lh-0'>{label}</h4>
              </Col>
              <Col xs='auto'>
                <Button color='success' size='sm' onClick={() => props.showAssetList(id)}>
                  <i className='fa fa-plus'/> add asset
                </Button>
              </Col>
            </Row>
          </CardHeader>
          <ListGroup>
            {renderAssetRows(assetHoldings.filter(({ shown }) => shown))}
            <ListGroupItem action onClick={() => props.showAssetList(id)} tag='button' className='btn btn-ultra-dark text-center text-success'>
              <i className='fa fa-plus fa-2x align-middle' />
              <span className='pl-2 h5'>add asset</span>
            </ListGroupItem>
          </ListGroup>
        </Card>
      </Col>
    ))

  return (
    <Layout {...props.layoutProps}>
      <Modal size='lg' center isOpen={props.isAssetListOpen} toggle={props.toggleAssetList} className='m-0 mx-md-auto' contentClassName='p-0'>
        <AssetList {...props.assetListProps} />
      </Modal>
      <SignTxModal showModal={props.showSignTxModal} toggleModal={props.handleToggleSignTxModal} />
      <Sticky innerZ={zIndexSticky} top='#header'>
        <div className={headerStyles.header}>
          <Row className='gutter-3 align-items-center'>
            <Col xs='6' md='4' className='align-self-stretch'>
              <Card body className='h-100 px-3 py-2 justify-content-center'>
                <WalletSummary wallet={portfolio}/>
              </Card>
            </Col>
            <Col xs='6' md='4' className='text-center align-self-stretch'>
              <Card body className='h-100 px-3 py-2 justify-content-center'>
                <div className='text-grey'>available to swap</div>
                <div className='text-grey text-white'>{display.fiat(props.allowance.fiat)} / {display.percentage(props.allowance.weight)}</div>
              </Card>
            </Col>
            <Col xs='6' md='2'>
              <Button color='faast' outline onClick={handleCancel} className='w-100'>cancel</Button>
            </Col>
            <Col xs='6' md='2'>
              <Button color='faast' onClick={handleSave} className='w-100' disabled={Boolean(disableSaveMessage)}>save</Button>
            </Col>
            {disableSaveMessage && (
              <Col xs='12'>
                <Alert color='danger' className='m-0 w-100 text-center'>
                  {disableSaveMessage}
                </Alert>
              </Col>
            )}
          </Row>
        </div>
      </Sticky>
      <div className={styles.modifyAssetList}>
        <Row className='gutter-x-0 gutter-y-3'>
          {renderHoldings(portfolio.nestedWallets)}
        </Row>
      </div>
    </Layout>
  )
}

export default ModifyView
