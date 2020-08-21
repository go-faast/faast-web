import * as React from 'react'
import { compose, setDisplayName, withProps, withHandlers, withState, withPropsOnChange, lifecycle } from 'recompose'
import { push } from 'react-router-redux'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import { Row, Col, Button, Card, Input } from 'reactstrap'
import { getAllActiveAssetsWithHoldings, areCurrentPortfolioBalancesUpdating } from 'Selectors/portfolio'
import Layout from 'Components/Layout'
import CoinIcon from 'Components/CoinIcon'
import T from 'Components/i18n/T'
import WalletDetail from 'Components/WalletDetail'
import LoadingFullscreen from 'Components/LoadingFullscreen'
import Fuse from 'fuse.js'
import HeroChart from 'Img/hero-chart.svg'
import { sortObjOfArrayByTwoProperties } from 'Utilities/helpers'
import { ellipsize } from 'Utilities/display'
import Units from 'Components/Units'
import classNames from 'class-names'
import styles from './style.scss'

const getQuery = ({ match }) => match.params.symbol
const MAX_RESULTS = 10

const WalletSearch = ({ push, selectedWallet, performSearch, query, results, className }) => (
  <Col 
    className={classNames(styles.walletList, className)}
    lg='2' 
    md='12'
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
          placeholder='Search wallets...'
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
            className='mt-0 py-2 px-0 pr-xl-4 pr-2 flat text-right'
            style={{ borderWidth: '0px', borderRadius: 0, borderRight: selected ? '2px solid #00d7b8' : '2px solid transparent', backgroundColor: selected && '#2e2e2e' }}
            color='ultra-dark' 
          >
            <CoinIcon symbol={symbol} width={16} height={16} size='' className='mr-2' />
            <span>{ellipsize(name, 12, 0)}</span>
            <small className={`${!selected && 'text-muted'} d-block mt-1`} style={{ opacity: .65 }}>
              <Units value={balance} precision={6} symbol={symbol} expand={false} />
            </small>
          </Col>
        )}
      )}
    </Row>
  </Col>
)

const Wallets = ({ push, selectedWallet, performSearch, query, results, updateShowMobileSearch,
  showMobileSearch, loadingBalances }) => {
  return (
    <Layout>
      {loadingBalances && (
        <LoadingFullscreen 
          label={<T tag='span' i18nKey='app.loading.balances'>Loading balances...</T>}  
        />
      )}
      <Card style={{ marginTop: 80, overflow: 'hidden' }} className='py-0'>
        <Row className='p-0 m-0'>
          {!showMobileSearch ? (
            <WalletSearch 
              className='p-0 d-lg-block d-none'
              push={push} 
              selectedWallet={selectedWallet} 
              performSearch={performSearch} 
              query={query} 
              results={results} 
            />
          ) : (
            <WalletSearch 
              className='p-0 d-lg-none d-block'
              push={push} 
              selectedWallet={selectedWallet} 
              performSearch={performSearch} 
              query={query} 
              results={results} 
            />
          )}
          <Col 
            className={classNames(styles.walletDetail, 'py-4 px-sm-5 px-2')}
            md='12'
            lg='10'
          >
            <div style={{ left: 0, width: '100%', height: 280 }} className={classNames('position-absolute')}>
              <img className='position-absolute' style={{ left: 0, filter: 'saturate(0)', width: '100%', height: 280 }} src={HeroChart} />
              <div className={styles.gradient}></div>  
            </div>
            <div className='position-relative' style={{ zIndex: 99 }}>
              <WalletDetail symbol={selectedWallet} showMobileSearch={(v) => updateShowMobileSearch(v)} />
            </div>
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
    assets: getAllActiveAssetsWithHoldings,
    balancesLoading: areCurrentPortfolioBalancesUpdating
  }), {
    push
  }),
  withState('query', 'updateQuery', ''),
  withState('showMobileSearch', 'updateShowMobileSearch', false),
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
  lifecycle({
    componentDidUpdate(prevProps) {
      const { selectedWallet, updateShowMobileSearch } = this.props
      if (prevProps.selectedWallet !== selectedWallet) {
        updateShowMobileSearch(false)
      }
    }
  })
)(Wallets)