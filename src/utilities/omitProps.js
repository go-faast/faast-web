import { mapProps } from 'recompose'
import { omit } from 'lodash'

/** HOC used to omit props from being passed into a component */
const omitProps = (...propsToOmit) => mapProps((props) => omit(props, propsToOmit))

export default omitProps