import { newScopedCreateAction } from 'Utilities/action'
import log from 'Utilities/log'
import Faast from 'Services/Faast'

const createAction = newScopedCreateAction(__filename)

export const restrictionsUpdated = createAction('UPDATE_RESTRICTIONS', (res) => ({ res }))
export const restrictionsError = createAction('RESTRICTIONS_ERROR')

export const fetchGeoRestrictions = () => (dispatch) => Promise.resolve()
  .then(() => {
    return Faast.fetchRestrictionsByIp()
      .then((res) => dispatch(restrictionsUpdated(res)))
      .catch((e) => {
        log.error(e)
      })
  }) 
