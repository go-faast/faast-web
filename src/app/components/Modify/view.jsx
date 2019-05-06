import React, { Fragment } from 'react'
import {
  Container, Row, Col, Button, Alert,
  Modal, ModalHeader, ModalBody,
  Card, CardHeader, ListGroup, ListGroupItem,
  Navbar,
} from 'reactstrap'
import accounting from 'accounting'
import { RIENumber } from 'riek'
import { Link } from 'react-router-dom'

import routes from 'Routes'
import config from 'Config'
import display from 'Utilities/display'

import Layout from 'Components/Layout'
import Slider from 'Components/Slider'
import AssetSelector from 'Components/AssetSelector'
import SwundleSubmitModal from 'Components/SwundleSubmitModal'
import Units from 'Components/Units'
import Overlay from 'Components/Overlay'
import ArrowIcon from 'Components/ArrowIcon'
import ListGroupButton from 'Components/ListGroupButton'
import CoinIcon from 'Components/CoinIcon'
import LoadingFullscreen from 'Components/LoadingFullscreen'
import WalletLabel from 'Components/WalletLabel'
import ModalRoute from 'Components/ModalRoute'
import T from 'Components/i18n/T'

import styles from './style'

const ModifyView = (props) => {
  const { portfolio, handleSave, disableSave, isAppRestricted } = props
  const saveButtonContent = (<T i18nKey='app.rebalance.saveChanges'><i className='fa fa-check mr-2' />Save Changes</T>)
  const addButtonContent = (<T i18nKey='app.rebalance.addAsset'><i className='fa fa-plus'/> add asset</T>)
  const removeButtonContent = (<T i18nKey='app.rebalance.remove'><i className='fa fa-times'/> remove</T>)

  const renderHoldings = (wallets) => wallets
    .map((wallet) => {
      const { id, isReadOnly, holdingsLoaded, assetHoldings } = wallet
      const addAssetDisabled = !holdingsLoaded
      return (
        <Col xs='12' key={id}>
          <Card>
            <CardHeader>
              <Row className='gutter-3 align-items-center'>
                <Col>
                  <WalletLabel wallet={wallet} tag='h4' />
                </Col>
                <Col xs='auto'>
                  <Button color='success' size='sm' className='flat' disabled={addAssetDisabled} onClick={() => props.showAssetList(id, 'top')}>
                    {addButtonContent}
                  </Button>
                </Col>
              </Row>
            </CardHeader>
            {isReadOnly ? (
              <Alert color='info' className='m-0 text-center'>
                This wallet is read-only. You need to <Link to='/connect' className='alert-link'><u>connect your wallet</u></Link> in order to trade assets.
              </Alert>
            ) : (
              <ListGroup>
                {!holdingsLoaded && (
                  <LoadingFullscreen label='Loading balances...' />
                )}
                {assetHoldings.filter(({ shown }) => shown).map((a) => {
                  const { walletId, symbol, name, change24, price, units, fiat, weight, swapEnabled, priceDecrease } = a
                  let unsendable = wallet.unsendableAssets.includes(symbol)
                  const restricted = a.restricted && isAppRestricted
                  let disabledMessage
                  if (!swapEnabled) {
                    disabledMessage = `Swapping ${name} is currently unavailable`
                  } else if (restricted) {
                    disabledMessage = `Swapping ${name} is unavailable in your location`
                  } else if (unsendable) {
                    disabledMessage = `Sending ${name} from this wallet currently unsupported`
                  }
                  const disabled = Boolean(disabledMessage)

                  const changeIconDirection = priceDecrease ? 'down' : 'up'
                  const changeColor = priceDecrease ? 'danger' : 'success'
                  const fiatPrice = display.fiat(price)
                  const percentChange24 = display.percentage(change24, true)
                  const originalFiat = display.fiat(fiat.original)
                  const originalWeight = display.percentage(a.weight.original)
                  const originalUnits = (<Units value={units.original} symbol={symbol} precision={6} />)
                  const adjustedFiat = accounting.toFixed(fiat.adjusted, 2)
                  const adjustedWeight = accounting.toFixed(weight.adjusted, 2)
                  const adjustedUnits = (<Units value={units.adjusted} symbol={symbol} precision={6} />)

                  let fiatInput
                  let weightInput

                  return (
                    <ListGroupItem key={symbol}>
                      {holdingsLoaded && disabled && !restricted && (
                        <Overlay className='justify-content-end'>
                          <Alert color='info' className='m-1'>
                            {disabledMessage}
                          </Alert>
                        </Overlay>
                      )}
                      {holdingsLoaded && restricted && (
                        <Overlay className='justify-content-end'>
                          <Alert color='info' className='m-1'>
                            <a className='text-white' href='https://medium.com/faast/faast-location-restrictions-9b14e100d828' target='_blank noreferrer noopener'>{disabledMessage}</a>
                          </Alert>
                        </Overlay>
                      )}
                      <Row className='gutter-x-3 align-items-center'>
                        <Col xs lg='4' xl='5' className='order-1'>
                          <Row className='gutter-3 align-items-center'>
                            <Col xs='auto' className='text-right'>
                              <CoinIcon size='md' symbol={symbol} inline />
                            </Col>
                            <Col xs='auto'><h5 className='m-0'>{name}</h5></Col>
                          </Row>
                          <Row className='gutter-x-4 my-3 align-items-center'>
                            <Col xs='auto'>
                              <Row className='gutter-3 align-items-center'>
                                <Col xs='auto'><ArrowIcon size='md' dir={changeIconDirection} color={changeColor} /></Col>
                                <Col>
                                  <div className={`h5 m-0 text-${changeColor}`}>{percentChange24}</div>
                                  <T tag='small' i18nKey='app.rebalance.24hChange' className='text-muted'>24h change</T>
                                </Col>
                              </Row>
                            </Col>
                            <Col xs='auto'>
                              <div className='h5 m-0'>{fiatPrice}</div>
                              <T tag='small' i18nKey='app.rebalance.currentPrice' className='text-muted'>current price</T>
                            </Col>
                          </Row>
                        </Col>
                        <Col xs='12' lg style={{ lineHeight: 1 }} className='order-3 order-lg-2'>
                          <Row className='gutter-3'>
                            <Col xs='12' sm='2' lg='auto'>
                              <Row className='gutter-3 flex-sm-column'>
                                <Col xs='3' sm='12'>&nbsp;</Col>
                                <Col xs='4' sm='12' className='text-muted text-sm-right'>
                                  <T tag='span' i18nKey='app.rebalance.before'>Before</T>
                                </Col>
                                <Col xs='5' sm='12' className='text-muted text-sm-right'>
                                  <T tag='span' i18nKey='app.rebalance.after'>After</T>
                                </Col>
                              </Row>
                            </Col>
                            <Col xs='12' sm='3' lg>
                              <Row className='gutter-3 flex-sm-column'>
                                <Col xs='3' sm='12' className='text-muted text-right text-sm-left'>
                                  <T tag='span' i18nKey='app.rebalance.value'>Value</T>
                                </Col>
                                <Col xs='4' sm='12'>{originalFiat}</Col>
                                <Col xs='5' sm='12'>
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
                                      <i onClick={() => fiatInput.startEditing()} className='fa fa-pencil ml-1 cursor-pointer' aria-hidden='true' />
                                    </span>
                                  )}
                                </Col>
                              </Row>
                            </Col>
                            <Col xs='12' sm='3' lg>
                              <Row className='gutter-3 flex-sm-column'>
                                <Col xs='3' sm='12' className='text-muted text-right text-sm-left'>
                                  <T tag='span' i18nKey='app.rebalance.weight'>Weight</T>
                                </Col>
                                <Col xs='4' sm='12'>{originalWeight}</Col>
                                <Col xs='5' sm='12'>
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
                                      <i onClick={() => weightInput.startEditing()} className='fa fa-pencil ml-1 cursor-pointer' aria-hidden='true' />
                                    </span>
                                  )}
                                </Col>
                              </Row>
                            </Col>
                            <Col xs='12' sm>
                              <Row className='gutter-3 flex-sm-column'>
                                <Col xs='3' sm='12' className='text-muted text-right text-sm-left'>
                                  <T tag='span' i18nKey='app.rebalance.units'>Units</T>
                                </Col>
                                <Col xs='4' sm='12'>{originalUnits}</Col>
                                <Col xs='5' sm='12'>{adjustedUnits}</Col>
                              </Row>
                            </Col>
                          </Row>
                        </Col>
                        <Col xs='auto' className='align-self-start order-2 order-lg-3'>
                          <Button color='danger' size='sm' disabled={disabled} className='flat' onClick={() => props.handleRemove(walletId, symbol)}>
                            {removeButtonContent}
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
                })}
                <ListGroupButton action onClick={() => props.showAssetList(id, 'bottom')} className='text-center text-success'>
                  <i className='fa fa-plus fa-2x align-middle' />
                  <T tag='span' i18nKey='app.rebalance.addAssetBottom' className='pl-2 h5'>add asset</T>
                </ListGroupButton>
              </ListGroup>
            )}
          </Card>
        </Col>
      )
    })

  const secondNavbar = (
    <Navbar color='ultra-dark' dark fixed='top' expand={config.navbar.expand}>
      <Container className='d-block'>
        <Row className='px-3_4r gutter-2 gutter-md-3 align-items-center'>
          <Col xs='auto' className='expand-only'>
            <div className='m-0 h5 font-weight-normal'>{portfolio.label}</div>
            <div className='text-muted'>{display.fiat(portfolio.totalFiat)}</div>
          </Col>
          <Col xs='auto' className='text-left text-md-right mr-auto mr-md-0 ml-md-auto'>
            <h4 className='m-0 text-primary font-weight-bold'>{display.fiat(props.allowance.fiat)} <small className='text-muted'>{display.percentage(props.allowance.weight)}</small></h4>
            <T tag='small' i18nKey='app.rebalance.availableBalance' className='text-muted'>available balance</T>
          </Col>
          <Col xs='auto' className='text-right'>
            <Button color='primary' onClick={handleSave} disabled={Boolean(disableSave)} className='flat'>{saveButtonContent}</Button>
          </Col>
          {typeof disableSave === 'string' && (
            <Col xs='12'>
              <Alert color='danger' className='m-0 w-100 text-center'>
                <i className='fa fa-exclamation-triangle mr-2' />{disableSave}
              </Alert>
            </Col>
          )}
        </Row>
      </Container>
    </Navbar>
  )

  return (
    <Layout className='pt-3 px-0 px-md-3' navbarProps={{ className: 'flat' }} afterNav={secondNavbar}>
      {(portfolio.nestedWallets.length === 0) ? (
        <Alert color='info' className='text-center w-100'>
          <T tag='span' i18nKey='app.rebalance.empty'>
            This portfolio is empty. To begin swapping you must <Link to='/connect' className='alert-link'>add a wallet</Link> first.
          </T>
        </Alert>
      ) : (
        <Fragment>
          <T i18nKey='app.rebalance.how'>
            <Button color='link' className='mb-3' tag={Link} to={routes.rebalanceInstructions()}>
              <i className='fa fa-question-circle'/> How do I use this?
            </Button>
          </T>
          <ModalRoute closePath={routes.rebalance.path} path={routes.rebalanceInstructions.path} render={({ isOpen, toggle }) => (
            <Modal isOpen={isOpen} toggle={toggle}>
              <ModalHeader toggle={toggle}>
                <T tag='span' i18nKey='app.rebalance.instructions'>Instructions</T>
              </ModalHeader>
              <ModalBody>
                <p className='mb-2'><b>
                  <T tag='span' i18nKey='app.rebalance.instructions1'>Rebalance your Portfolio - 3 simple steps:</T>
                </b></p>
                <ol>
                  <li className='mb-1'>
                    <T tag='span' i18nKey='app.rebalance.instructions2'>
                      Drag a slider left to decrease weight of an asset.
                      Use </T> 
                    <span className='text-danger'>{removeButtonContent}</span> <T tag='span' i18nKey='app.rebalance.instructions3'>to remove entire asset.</T>
                  </li>
                  <li className='mb-1'>
                    <T tag='span' i18nKey='app.rebalance.instructions4'> Drag a slider right to increase weight of an asset.
                    Use </T> <span className='text-success'>{addButtonContent}</span><T tag='span' i18nKey='app.rebalance.instructions5'> to add a new asset.<br/>
                      <i>(Note: To increase weight, you must have decreased weight of another asset)</i></T>
                  </li>
                  <li>
                    <T tag='span' i18nKey='app.rebalance.instructions6'>Click</T> <span className='text-primary'>{saveButtonContent}</span> <T tag='span' i18nKey='app.rebalance.instructions7'>when finished to review changes.</T>
                  </li>
                </ol>
              </ModalBody>
            </Modal>
          )}/>
          <Row className='gutter-x-0 gutter-y-3'>
            {renderHoldings(portfolio.nestedWallets)}
          </Row>
        </Fragment>
      )}
      <Modal size='lg' isOpen={props.isAssetListOpen} toggle={props.toggleAssetList} className='m-0 mx-md-auto' contentClassName='p-0' autoFocus={false}>
        <ModalHeader toggle={props.toggleAssetList} tag='h4' className='text-primary'>
          Add Asset
        </ModalHeader>
        <ModalBody>
          {props.isAssetListOpen && /* Reactstrap + redux-forms workaround https://github.com/reactstrap/reactstrap/issues/820 */ (
            <AssetSelector {...props.assetListProps} />
          )}
        </ModalBody>
      </Modal>
      <SwundleSubmitModal />
    </Layout>
  )
}

export default ModifyView
