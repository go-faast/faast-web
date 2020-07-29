import PropTypes from 'prop-types'
import { compose, setDisplayName, setPropTypes, defaultProps, mapProps } from 'recompose'
import { connect } from 'react-redux'
import { omit } from 'lodash'

import { getAssetIconUrl } from 'Selectors/asset'
import Icon from 'Components/Icon'

import Erc20Svg from 'Img/coin/ERC20.svg?inline'
import QuestionMarkSvg from 'Img/question-mark-white.svg?inline'

export default compose(
  setDisplayName('CoinIcon'),
  setPropTypes({
    symbol: PropTypes.string.isRequired, // Coin symbol (e.g. ETH, BTC)
    ...Icon.stylePropTypes
  }),
  defaultProps({
    size: 'md'
  }),
  connect((state, props) => {
    const symbol = props.symbol
    if (symbol === 'ERC20') {
      return { src: Erc20Svg, fill: '#fff' }
    }
    let iconSrc = getAssetIconUrl(state, symbol)
    if (!iconSrc) {
      iconSrc = QuestionMarkSvg
    }
    return { src: iconSrc }
  }),
  mapProps((props) => omit(props, 'symbol', 'dispatch'))
)(Icon)
