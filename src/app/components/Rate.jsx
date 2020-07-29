import React from 'react'
import PropTypes from 'prop-types'
import { compose, setDisplayName, setPropTypes } from 'recompose'

import { numberish } from 'Utilities/propTypes'

import Units from 'Components/Units'

export default compose(
  setDisplayName('Rate'),
  setPropTypes({
    from: PropTypes.string.isRequired,
    to: PropTypes.string.isRequired,
    rate: numberish,
  }),
)(({ from, to, rate }) => (
  <Units value={rate} symbol={from} precision={8} prefix={`1 ${to} = `}/>
))
