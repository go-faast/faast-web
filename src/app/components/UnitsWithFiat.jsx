import { compose, setDisplayName, setPropTypes, mapProps } from 'recompose'
import { connect } from 'react-redux'
import { omit } from 'lodash'

import display from 'Utilities/display'

import { getAssetPrice } from 'Selectors'
import Units from 'Components/Units'

export default compose(
  setDisplayName('UnitsWithFiat'),
  setPropTypes(Units.propTypes),
  connect((state, { symbol }) => ({
    price: getAssetPrice(state, symbol)
  })),
  mapProps(({ price, value, ...props }) => ({
    ...omit(props, 'dispatch'),
    suffix: price && ` (${display.fiat(price.times(value))})`,
    value,
  }))
)(Units)
