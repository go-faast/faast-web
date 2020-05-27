import * as React from 'react'
import { compose, setDisplayName, withProps } from 'recompose'
import { push } from 'react-router-redux'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import { Row, Col, Button, Card } from 'reactstrap'
import { getAllAssetsArray } from 'Common/selectors/asset'
import Layout from 'Components/Layout'
import CoinIcon from 'Components/CoinIcon'
import WalletDetail from 'Components/WalletDetail'

const getQuery = ({ match }) => match.params.symbol

const Wallets = ({ assets, push, selectedWallet }) => {
  return (
    <Layout>
      <Card style={{ marginTop: 80 }} className='py-4'>
        <Row>
          <Col className='ml-5' xs='2' style={{ maxHeight: 500, overflowY: 'scroll' }}>
            <Row>
              {assets.map(asset => {
                return (
                  <Col 
                    tag={Button} 
                    onClick={() => push(`/wallets/${asset.symbol}`)} 
                    size='sm' 
                    xs='12'
                    className='mt-0 py-2 flat'
                    style={{ borderWidth: '0px', borderRadius: 0 }}
                    color='dark' 
                    key={asset.symbol}
                  >
                    <CoinIcon symbol={asset.symbol} className='mr-2' />
                    {asset.symbol}
                  </Col>
                )
              })}
            </Row>
          </Col>
          <Col className='ml-5' xs='8'>
            <WalletDetail symbol={selectedWallet} />
          </Col>
        </Row>
      </Card>
    </Layout>
  )
}

export default compose(
  setDisplayName('Wallets'),
  withProps((props) => {
    const selectedWallet = getQuery(props) || 'BTC'
    return ({
      selectedWallet,
    })
  }),
  connect(createStructuredSelector({
    assets: getAllAssetsArray
  }), {
    push
  }),
)(Wallets)