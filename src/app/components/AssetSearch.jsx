import React, { Fragment } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { createStructuredSelector } from 'reselect'
import { compose, setDisplayName, setPropTypes,
  defaultProps, withPropsOnChange, withHandlers, withState } from 'recompose'
import { Input, InputGroup, InputGroupAddon, Button, ListGroup, ListGroupItem } from 'reactstrap'
import PropTypes from 'prop-types'
import Fuse from 'fuse.js'

import routes from 'Routes'
import CoinIcon from 'Components/CoinIcon'
import debounceHandler from 'Hoc/debounceHandler'

import { sortByProperty } from 'Utilities/helpers'
import { getAllAssetsArray } from 'Selectors'

const DEBOUNCE_WAIT = 400 // ms

const AssetSearch = ({ size, placeholder, 
  inputProps, buttonProps, inputGroupProps, handleSearchChange, results, 
  query, resetQuery }) => {
  return (
    <Fragment>
      <InputGroup className='position-relative' {...inputGroupProps}>
        <Input
          component='input'
          name='assetSearch'
          type='search'
          autoCorrect='false'
          autoCapitalize='false'
          spellCheck='false'
          placeholder={placeholder}
          onChange={handleSearchChange}
          value={query}
          {...inputProps}
        />
        <InputGroupAddon addonType="append">
          <Button color='primary' outline type='submit' size={size} {...buttonProps}><i className='fa fa-search fa'></i></Button>
        </InputGroupAddon>
        {query ? (
          <ListGroup 
            className='position-absolute'
            style={{ width: '100%', top: '100%', zIndex: 99, maxHeight: '305px', overflow: 'auto' }} 
          >
            {results.map(({ name, symbol }) => { 
              return (
                <ListGroupItem 
                  onClick={resetQuery}
                  className='text-white' 
                  tag={Link} 
                  to={routes.assetDetail(symbol)} 
                  key={name}
                >
                  <CoinIcon symbol={symbol} inline size='sm' className='m-1'/>
                  {name}
                </ListGroupItem>)
            })}
          </ListGroup>) : null
        }
      </InputGroup>
    </Fragment>
  )
}

export default compose(
  setDisplayName('AssetSearch'),
  connect(createStructuredSelector({
    assets: getAllAssetsArray,
  })),
  setPropTypes({
    sortBy: PropTypes.string,
    displayResults: PropTypes.func,
    size: PropTypes.string,
    placeholder: PropTypes.string,
    inputProps: PropTypes.object,
    inputGroupProps: PropTypes.object,
    buttonProps: PropTypes.object,
  }),
  defaultProps({
    sortBy: 'marketCap',
    displayResults: (results) => results,
    size: 'sm',
    placeholder: 'Search assets...',
    formProps: {},
    inputProps: {},
    inputGroupProps: {},
    buttonProps: {},
  }),
  withPropsOnChange(['assets'], ({ assets }) => {
    const fuse = new Fuse(assets, {
      shouldSort: true,
      threshold: 0.6,
      location: 0,
      distance: 100,
      minMatchCharLength: 2,
      keys: ['name', 'symbol']
    })
    console.log('create fuse')
    return ({
      fuse
    })
  }),
  withState('results', 'updateResults', []),
  withHandlers({
    performSearch: ({ updateResults, fuse, sortBy }) => (query) => {
      let results
      if (!query) {
        results = []
      } else {
        results = fuse.search(query).slice(0,10)
        results = sortByProperty(results, sortBy)
      }
      updateResults(results)
    }
  }),
  debounceHandler('performSearch', DEBOUNCE_WAIT),
  withState('query', 'updateQuery', ''),
  withHandlers({
    handleSearchChange: ({ updateQuery, performSearch }) => (event) => {
      const query = event.target.value
      updateQuery(query)
      performSearch(query)
    },
    resetQuery: ({ updateQuery }) => () => updateQuery('')
  }),
)(AssetSearch)
