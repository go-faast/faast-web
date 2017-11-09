import { reduxForm } from 'redux-form'
import DerivationPathForm from 'Views/DerivationPathForm'

export default reduxForm({
  form: 'derivationPathForm'
})(DerivationPathForm)
