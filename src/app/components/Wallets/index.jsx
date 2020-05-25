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
      <Card style={{ marginTop: 80 }} className='pt-4'>
        <Row>
          <Col xs='2'>
            <Row>
              {assets.map(asset => {
                return (
                  <Col tag={Button} onClick={() => push(`/wallets/${asset.symbol}`)} size='sm' color='ultra-dark' key={asset.symbol} xs='12'>
                    <CoinIcon symbol={asset.symbol} className='mr-2' />
                    {asset.symbol}
                  </Col>
                )
              })}
            </Row>
          </Col>
          <Col xs='9'>
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