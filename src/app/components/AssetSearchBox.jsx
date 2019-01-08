import React, { Fragment } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { createStructuredSelector } from 'reselect'
import { compose, setDisplayName, setPropTypes,
  defaultProps, withPropsOnChange, withHandlers, withState } from 'recompose'
import { Form, InputGroupAddon, Button, ListGroup, ListGroupItem } from 'reactstrap'
import PropTypes from 'prop-types'
import Fuse from 'fuse.js'
import { reduxForm } from 'redux-form'
import { push as pushAction } from 'react-router-redux'

import routes from 'Routes'
import { getAllAssetsArray } from 'Selectors'

import debounceHandler from 'Hoc/debounceHandler'
import CoinIcon from 'Components/CoinIcon'
import ReduxFormField from 'Components/ReduxFormField'

const DEBOUNCE_WAIT = 400 // ms
const MAX_RESULTS = 10
const FORM_NAME = 'assetSearch'

const AssetSearch = ({
  size, placeholder, buttonProps, performSearch, results, 
  dirty, reset, style, className, handleSubmit,
}) => (
  <Form
    onSubmit={handleSubmit}
    style={{ width: '100%', maxWidth: '300px', ...style }}
    className={className}
  >
    <ReduxFormField
      name='query'
      type='search'
      autoCorrect='false'
      autoCapitalize='false'
      spellCheck='false'
      placeholder={placeholder}
      onChange={performSearch}
      addonAppend={(
        <Fragment>
          <InputGroupAddon addonType="append">
            <Button color='primary' outline type='submit' size={size} {...buttonProps}><i className='fa fa-search fa'></i></Button>
          </InputGroupAddon>
          {dirty && (
            <ListGroup 
              className='position-absolute'
              style={{ width: '100%', top: '100%', zIndex: 99, maxHeight: '305px', overflow: 'auto' }}>
              {results.map(({ name, symbol }) => (
                <ListGroupItem 
                  onClick={reset}
                  className='text-white' 
                  tag={Link} 
                  to={routes.assetDetail(symbol)} 
                  key={name}
                >
                  <CoinIcon symbol={symbol} inline size='sm' className='m-1'/>
                  <span className='pl-2'>{name} <small className='text-muted'>[{symbol}]</small></span>
                </ListGroupItem>
              ))}
            </ListGroup>
          )}
        </Fragment>
      )}
    />
  </Form>
)

export default compose(
  setDisplayName('AssetSearchBox'),
  setPropTypes({
    displayResults: PropTypes.func,
    size: PropTypes.string,
    placeholder: PropTypes.string,
    inputProps: PropTypes.object,
    buttonProps: PropTypes.object,
  }),
  defaultProps({
    displayResults: (results) => results,
    size: 'sm',
    placeholder: 'Search assets...',
    inputProps: {},
    inputGroupProps: {},
    buttonProps: {},
  }),
  connect(createStructuredSelector({
    assets: getAllAssetsArray,
  }), {
    push: pushAction
  }),
  withPropsOnChange(['assets'], ({ assets }) => {
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
  withState('results', 'updateResults', []),
  withHandlers({
    performSearch: ({ updateResults, fuse }) => (_, query) => {
      console.log({ query })
      let results
      if (!query) {
        results = []
      } else {
        results = fuse.search(query).slice(0, MAX_RESULTS)
      }
      updateResults(results)
    },
    onSubmit: ({ results, push }) => (values, dispatch, { reset }) => {
      if (results.length > 0) {
        push(routes.assetDetail(results[0].symbol))
        reset()
      }
    },
  }),
  debounceHandler('performSearch', DEBOUNCE_WAIT),
  reduxForm({
    form: FORM_NAME,
    initialValues: {
      query: '',
    }
  }),
)(AssetSearch)
