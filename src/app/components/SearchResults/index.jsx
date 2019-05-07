import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import { compose, setDisplayName, setPropTypes, lifecycle } from 'recompose'
import { Row, Col, Button } from 'reactstrap'
import routes from 'Routes'

import {
  getAccountSearchError, getAccountSearchPending, getAccountSearchResultWalletWithHoldings,
  isAccountSearchResultWalletInPortfolio,
} from 'Selectors'
import { searchAddress, viewInPortfolio, addToPortfolio } from 'Actions/accountSearch'

import Layout from 'Components/Layout'
import Balances from 'Components/Balances'
import LoadingFullscreen from 'Components/LoadingFullscreen'
import ShareButton from 'Components/ShareButton'
import T from 'Components/i18n/T'

const getQuery = ({ match }) => match.params.addressQuery

const showStats = true

export default compose(
  setDisplayName('SearchResults'),
  setPropTypes({
    match: PropTypes.object.isRequired
  }),
  connect(createStructuredSelector({
    error: getAccountSearchError,
    pending: getAccountSearchPending,
    wallet: getAccountSearchResultWalletWithHoldings,
    isAlreadyInPortfolio: isAccountSearchResultWalletInPortfolio,
  }), {
    search: searchAddress,
    handleAddToPortfolio: addToPortfolio,
    handleViewInPortfolio: viewInPortfolio,
  }),
  lifecycle({
    componentWillMount () {
      this.props.search(getQuery(this.props))
    },
    componentWillReceiveProps (nextProps) {
      const currentQuery = getQuery(this.props)
      const nextQuery = getQuery(nextProps)
      if (currentQuery !== nextQuery) {
        this.props.search(nextQuery)
      }
    }
  })
)(({ pending, error, wallet, handleViewInPortfolio, handleAddToPortfolio, isAlreadyInPortfolio }) => (
  <Layout className='pt-3'>
    {(pending || error || !wallet) ? (
      <LoadingFullscreen label='Loading wallet...' error={error}/>
    ) : (
      <Row className='gutter-3 align-items-end'>
        <Col>
          <h4 className='m-0 text-primary'>{wallet.label}</h4>
        </Col>
        <Col xs='auto'>
          {isAlreadyInPortfolio ? (
            <Button size='sm' color='primary' onClick={handleViewInPortfolio}>
              <T tag='span' i18nKey='app.searchResults.view'>View in portfolio</T>
            </Button>
          ) : (
            <Button size='sm' color='primary' onClick={() => handleAddToPortfolio(routes.dashboard())}>
              <T tag='span' i18nKey='app.searchResults.add'>Add to portfolio</T>
            </Button>
          )}
        </Col>
        {showStats && (
          <Col xs='auto'>
            <ShareButton wallet={wallet}/>
          </Col>
        )}
        <Col xs='12'>
          <Balances 
            wallet={wallet}
            showStats={showStats}
            handleAdd={() => handleAddToPortfolio(routes.dashboard())}
            isAlreadyInPortfolio={isAlreadyInPortfolio}
          />
        </Col>
      </Row>
    )}
  </Layout>
))
