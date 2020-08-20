import * as React from 'react'
import { compose, setDisplayName, withProps, withHandlers, withState, withPropsOnChange } from 'recompose'
import { push } from 'react-router-redux'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import { Row, Col, Button, Card, Input } from 'reactstrap'
import { getAllActiveAssetsWithHoldings } from 'Selectors/portfolio'
import Layout from 'Components/Layout'
import CoinIcon from 'Components/CoinIcon'
import WalletDetail from 'Components/WalletDetail'
import Fuse from 'fuse.js'
import HeroChart from 'Img/hero-chart.svg'
import { sortObjOfArrayByTwoProperties } from 'Utilities/helpers'
import { ellipsize } from 'Utilities/display'
import Units from 'Components/Units'

const getQuery = ({ match }) => match.params.symbol
const MAX_RESULTS = 10

const Wallets = ({ push, selectedWallet, performSearch, query, results, }) => {
  return (
    <Layout>
      <Card style={{ marginTop: 80, overflow: 'hidden' }} className='py-0'>
        <Row className='p-0 m-0'>
          <Col 
            className='p-0' 
            xs='2' 
            style={{  maxHeight: 'calc(100vh - 100px)', overflowY: 'scroll', borderRight: '1px solid #353535' }}
          >
            <Row className='m-0'>
              <Col className='p-0' xs='12'>
                <Input
                  value={query}
                  type='search'
                  className='flat mb-2 pl-3'
                  style={{ backgroundColor: '#272727', borderLeft: 'none', borderRight: 'none', borderTop: 'none', borderRadius: 0 }}
                  color='dark'
                  onChange={performSearch}
                  placeholder='Search by asset...'
                  autoCorrect='false'
                  autoCapitalize='false'
                />
              </Col>
              {results.map(({ name, symbol, balance }) => {
                const selected = selectedWallet == symbol
                return (
                  <Col 
                    tag={Button} 
                    xs='12'
                    key={symbol}
                    onClick={() => push(`/wallets/${symbol}`)} 
                    size='sm' 
                    className='mt-0 py-2 px-0 flat text-right'
                    style={{ borderWidth: '0px', borderRadius: 0, borderRight: selected ? '2px solid #00d7b8' : '2px solid transparent', backgroundColor: selected && '#2e2e2e' }}
                    color='ultra-dark' 
                  >
                    <CoinIcon symbol={symbol} width={16} height={16} size='' className='mr-2' />
                    <span className='mr-4'>{ellipsize(name, 12, 0)}</span>
                    <small className={`${!selected && 'text-muted'} d-block mt-1 mr-4`} style={{ opacity: .65 }}>
                      <Units value={balance} precision={6} symbol={symbol} expand={false} />
                    </small>
                  </Col>
                )}
              )}
            </Row>
          </Col>
          <Col 
            style={{  maxHeight: 'calc(100vh - 100px)', overflowY: 'scroll' }}
            className='py-4 pl-5' 
            xs='10'
          >
            <img style={{ width: '100%', height: 250, left: 0, opacity: .6, filter: 'saturate(0)' }} className='position-absolute' src={HeroChart} />
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
    assets: getAllActiveAssetsWithHoldings
  }), {
    push
  }),
  withState('query', 'updateQuery', ''),
  withHandlers({
    applySortOrder: () => (list) => {
      return list.sort(sortObjOfArrayByTwoProperties(['-balanceUSD', 'name']))
    }
  }),
  withState('results', 'updateResults', ({ assets, applySortOrder }) => applySortOrder(assets)),
  withPropsOnChange(['assets'], ({ assets, query, applySortOrder, updateResults }) => {
    if (!query) {
      updateResults(applySortOrder(assets))
    }
    const fuse = new Fuse(assets, {
      shouldSort: true,
      threshold: 0.6,
      location: 0,
      distance: 100,
      minMatchCharLength: 2,
      keys: [{
        name: 'symbol',
        weight: 0.8,
      }, {
        name: 'name',
        weight: 0.2,
      }],
    })
    return ({
      fuse
    })
  }),
  withHandlers({
    performSearch: ({ updateResults, fuse, updateQuery, assets, applySortOrder }) => (e) => {
      const query = e.target.value
      updateQuery(query)
      let results
      if (!query) {
        results = applySortOrder(assets)
      } else {
        results = applySortOrder(fuse.search(query).slice(0, MAX_RESULTS))
      }
      updateResults(results)
    },
  }),
)(Wallets)