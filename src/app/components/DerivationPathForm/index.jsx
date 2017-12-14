import { reduxForm } from 'redux-form'
import DerivationPathFormView from './view'

export default reduxForm({
  form: 'derivationPathForm'
})(DerivationPathFormView)
