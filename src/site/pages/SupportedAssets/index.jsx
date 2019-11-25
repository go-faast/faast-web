import { pick } from 'lodash'
import * as React from 'react'
import { connect } from 'react-redux'
import { withRouteData } from 'react-static'
import { Table, Media, Card, CardBody, CardHeader } from 'reactstrap'
import Icon from 'Components/Icon'
import { createStructuredSelector } from 'reselect'
import { getAllAssetsArray, areAssetsLoaded } from 'Common/selectors/asset'
import { compose, setDisplayName, lifecycle, withProps } from 'recompose'
import classNames from 'class-names'

// import logoImg from 'Img/faast-logo.png'
import withTracker from 'Site/components/withTracker'
import Footer from 'Site/components/Footer'
import Header from 'Site/components/Header'
import CoinIcon from 'Components/CoinIcon'
import { sortObjOfArray } from 'Utilities/helpers'
import { retrieveAssets } from 'Common/actions/asset'

import { whiteCard, table, thColor, customHover } from './style.scss'
import checkmark from 'Img/checkmark.svg?inline'
import cross from 'Img/delete-x.svg?inline'

const TableRow = ({ asset: { receive, deposit, name, symbol } }) => {
  return (
    <tr>
      <td className='pl-4'>
        <Media>
          <Media left>
            <CoinIcon 
              className='mr-2' 
              symbol={symbol} 
              style={{ width: '25px', height: '25px' }} 
              inline
            /> 
          </Media>
          <Media>
            <h6 style={{ color: '#222' }} className='textEllipsis m-0 mt-1 mr-1'>{name}</h6>
            <small style={{ position: 'relative', top: '4px', color: '#444' }}>[{symbol}]</small>
          </Media>
        </Media>
      </td>
      <td className='pt-2'>
        <span>{receive ? (
          <Icon src={checkmark} style={{ fill: '#757682', height: '20px', width: '20px' }} />
        ) : (
          <Icon src={cross} style={{ fill: '#f77e9e', height: '20px', width: '20px' }} />
        )}</span>
      </td>
      <td className='pt-2'>
        <span>{deposit ? (
          <Icon src={checkmark} style={{ fill: '#757682', height: '20px', width: '20px' }} />
        ) : (
          <Icon src={cross} color='#f77e9e' style={{ fill: '#f77e9e', height: '20px', width: '20px' }} />
        )}</span>
      </td>
      <td className='pt-2'>
        <a href={`/app/swap?to=${symbol}`}>Swap {symbol}</a>
      </td>
    </tr>
  )
}

export default compose(
  setDisplayName('SupportedAssets'),
  withTracker,
  connect(createStructuredSelector({
    assets: getAllAssetsArray,
    areAssetsLoaded: areAssetsLoaded
  }), {
    retrieveAssets,
  }),
  withProps(({ assets }) => ({
    assetList: sortObjOfArray(assets.filter(({ deposit, receive }) => deposit || receive)
      .map((asset) => pick(asset, 'symbol', 'name', 'deposit', 'receive', 'marketCap')), 'marketCap', 'desc')
  })),
  lifecycle({
    componentWillMount() {
      const { retrieveAssets } = this.props
      retrieveAssets()
    }
  }),
  withRouteData,
)(({ supportedAssets, areAssetsLoaded, assetList, translations = {} }) => {
  supportedAssets = areAssetsLoaded ? assetList : supportedAssets
  return (
    <div style={{ backgroundColor: '#fcfdff' }}>
      <Header translations={translations} theme='dark' headerColor='#303030' />
      <div className='mx-auto mt-4 mb-5' style={{ maxWidth: 1200 }}>
        <a 
          href='/knowledge/article/supported-assets'
          className={classNames(customHover, 'px-3 py-2 mb-3 mx-0 d-block')}
          style={{ 
            boxShadow: '0px 2px 4px rgba(0,0,0,.05)',
            background: 'linear-gradient(45deg, #00c19e 0%, #008472 100%)', 
            borderRadius: 2, 
          }}
        >
          <i className='fa fa-info-circle mr-3 text-white'></i>
          <span className='text-white'>Click here to discover in-depth overviews of all of our supported cryptocurrencies</span>
        </a>
        <Card className={classNames(whiteCard, 'flat')} style={{ borderColor: '#F3F5F8' }}>
          <CardHeader className={classNames(whiteCard, thColor)} style={{ borderColor: '#F3F5F8' }}>
            <span>Supported Assets</span>
          </CardHeader>
          <CardBody className='border-0'>
            <Table className={classNames(table)} hover striped responsive>
              <thead>
                <tr>
                  <th className={classNames(thColor, 'pl-3 pl-md-5 border-0')}>
                    <span>Coin</span>
                  </th>
                  <th className={classNames(thColor, 'border-0')}>
                    <span>Buy Enabled</span>
                  </th>
                  <th className={classNames(thColor, 'border-0')}>
                    <span>Sell Enabled</span>
                  </th>
                  <th className={classNames(thColor, 'border-0')}>
                    <span>Buy / Sell</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {supportedAssets.map((asset) => (
                  <TableRow 
                    key={asset.symbol} 
                    asset={asset} 
                  />
                )
                )}
              </tbody>
            </Table>
          </CardBody>
        </Card>
      </div>
      <Footer showEmail={false} translations={translations} />
    </div>
  )
})
