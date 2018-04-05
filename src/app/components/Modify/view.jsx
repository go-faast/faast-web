import React from 'react'
import {
  Container, Row, Col, Button, Alert,
  Modal, ModalHeader, ModalBody,
  Card, CardHeader, ListGroup, ListGroupItem,
  Navbar,
} from 'reactstrap'
import accounting from 'accounting'
import { RIENumber } from 'riek'
import { Link } from 'react-router-dom'

import display from 'Utilities/display'

import Layout from 'Components/Layout'
import Slider from 'Components/Slider'
import AssetSelector from 'Components/AssetSelector'
import SignTxModal from 'Components/SignTxModal'
import Units from 'Components/Units'
import SelectPortfolioDropdown from 'Components/SelectPortfolioDropdown'
import Overlay from 'Components/Overlay'
import ArrowIcon from 'Components/ArrowIcon'
import ListGroupButton from 'Components/ListGroupButton'
import CoinIcon from 'Components/CoinIcon'
import LoadingFullscreen from 'Components/LoadingFullscreen'
import IconLabel from 'Components/IconLabel'

import styles from './style'

const ModifyView = (props) => {
  const { portfolio, handleSave, disableSave } = props

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
              <Col xs='auto' className='text-right'>
                <CoinIcon size='md' symbol={symbol} />
              </Col>
              <Col xs='auto'><h5 className='m-0'>{name}</h5></Col>
            </Row>
            <Row className='gutter-x-4 my-3 align-items-center'>
              <Col xs='auto'>
                <Row className='gutter-3 align-items-center'>
                  <Col xs='auto'><ArrowIcon size='md' dir={changeIconDirection} color={changeColor} /></Col>
                  <Col>
                    <div className={`h5 m-0 text-${changeColor}`}>{percentChange24}</div>
                    <small className='text-muted'>24h change</small>
                  </Col>
                </Row>
              </Col>
              <Col xs='auto'>
                <div className='h5 m-0'>{fiatPrice}</div>
                <small className='text-muted'>current price</small>
              </Col>
            </Row>
          </Col>
          <Col xs='12' lg style={{ lineHeight: 1 }} className='order-3 order-lg-2'>
            <Row className='gutter-3'>
              <Col xs='12' sm='2' lg='auto'>
                <Row className='gutter-3 flex-sm-column'>
                  <Col xs='3' sm='12'>&nbsp;</Col>
                  <Col xs='4' sm='12' className='text-muted text-sm-right'>Before</Col>
                  <Col xs='5' sm='12' className='text-muted text-sm-right'>After</Col>
                </Row>
              </Col>
              <Col xs='12' sm='3' lg>
                <Row className='gutter-3 flex-sm-column'>
                  <Col xs='3' sm='12' className='text-muted text-right text-sm-left'>Value</Col>
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
                <Row className="gutter-3 flex-sm-column">
                  <Col xs='3' sm='12' className='text-muted text-right text-sm-left'>Weight</Col>
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
                <Row className="gutter-3 flex-sm-column">
                  <Col xs='3' sm='12' className='text-muted text-right text-sm-left'>Units</Col>
                  <Col xs='4' sm='12'>{originalUnits}</Col>
                  <Col xs='5' sm='12'>{adjustedUnits}</Col>
                </Row>
              </Col>
            </Row>
          </Col>
          <Col xs='auto' className='align-self-start order-2 order-lg-3'>
            <Button color='danger' size='sm' disabled={disabled} className='flat' onClick={() => props.handleRemove(walletId, symbol)}>
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
    .map(({ id, label, isReadOnly, typeLabel, iconProps, balancesLoaded, assetHoldings }) => (
      <Col xs='12' key={id}>
        <Card>
          <CardHeader>
            <Row className='gutter-3 align-items-center'>
              <Col>
                <h4 className='m-0 lh-0'>{label}</h4>
                <IconLabel label={typeLabel} iconProps={iconProps}/>
              </Col>
              <Col xs='auto'>
                <Button color='success' size='sm' className='flat' disabled={!balancesLoaded} onClick={() => props.showAssetList(id)}>
                  <i className='fa fa-plus'/> add asset
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
              {!balancesLoaded && (<LoadingFullscreen center/>)}
              {renderAssetRows(assetHoldings.filter(({ shown }) => shown))}
              <ListGroupButton action onClick={() => props.showAssetList(id)} className='text-center text-success'>
                <i className='fa fa-plus fa-2x align-middle' />
                <span className='pl-2 h5'>add asset</span>
              </ListGroupButton>
            </ListGroup>
          )}
        </Card>
      </Col>
    ))

  const secondNavbar = (
    <Navbar color='ultra-dark' dark fixed='top' expand='md'>
      <Container className='d-block'>
        <Row className='px-3_4r gutter-2 gutter-md-3 justify-content-left align-items-center'>
          <Col xs='auto' className='expand-only'>
            <SelectPortfolioDropdown togglerProps={{ color: 'link-plain', block: true, className: 'm-0 h4 font-weight-normal' }} inNavbar/>
            <div className='text-muted'>{display.fiat(portfolio.totalFiat)}</div>
          </Col>
          <Col xs='auto' className='text-left text-md-right mr-auto mr-md-0 ml-0 ml-md-auto'>
            <h4 className='m-0 text-primary font-weight-bold'>{display.fiat(props.allowance.fiat)} <small className='text-muted'>{display.percentage(props.allowance.weight)}</small></h4>
            <small className='text-muted'>available to swap</small>
          </Col>
          <Col xs='auto'>
            <Button color='primary' onClick={handleSave} disabled={Boolean(disableSave)} className='flat'><i className='fa fa-check mr-2'/>Save Changes</Button>
          </Col>
          {typeof disableSave === 'string' && (
            <Col xs='12'>
              <Alert color='danger' className='m-0 w-100 text-center'>
                <i className='fa fa-exclamation-triangle mr-2'/>{disableSave}
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
          This portfolio is empty. To begin swapping you must <Link to='/connect' className='alert-link'>add a wallet</Link> first.
        </Alert>
      ) : (
        <Row className='gutter-x-0 gutter-y-3'>
          {renderHoldings(portfolio.nestedWallets)}
        </Row>
      )}
      <Modal size='lg' isOpen={props.isAssetListOpen} toggle={props.toggleAssetList} className='m-0 mx-md-auto' contentClassName='p-0'>
        <ModalHeader toggle={props.toggleAssetList} tag='h4' className='text-primary'>
          Add Asset
        </ModalHeader>
        <ModalBody>
          {props.isAssetListOpen && /* Reactstrap + redux-forms workaround https://github.com/reactstrap/reactstrap/issues/820 */ ( 
            <AssetSelector {...props.assetListProps} />
          )}
        </ModalBody>
      </Modal>
      <SignTxModal showModal={props.showSignTxModal} toggleModal={props.handleToggleSignTxModal} />
    </Layout>
  )
}

export default ModifyView
