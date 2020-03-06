import { compose, setDisplayName, setPropTypes, mapProps } from 'recompose'
import { connect } from 'react-redux'
import { omit } from 'lodash'
import { createStructuredSelector } from 'reselect'

import display from 'Utilities/display'

import { getAssetPrice } from 'Selectors'
import { getSelectedSymbol } from 'Selectors/currency'
import Units from 'Components/Units'

export default compose(
  setDisplayName('UnitsWithFiat'),
  setPropTypes(Units.propTypes),
  connect(createStructuredSelector({
    price: (state, { symbol }) => getAssetPrice(state, symbol),
    currencySymbol: getSelectedSymbol,
  })),
  mapProps(({ price, currencySymbol, value, ...props }) => ({
    ...omit(props, 'dispatch'),
    suffix: price && ` (${currencySymbol}${display.fiat(price.times(value))})`,
    value,
  }))
)(Units)
