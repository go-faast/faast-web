import { newScopedCreateAction } from 'Utilities/action'
import log from 'Utilities/log'
import Faast from 'Services/Faast'

const createAction = newScopedCreateAction(__filename)

export const restrictionsUpdated = createAction('UPDATE_RESTRICTIONS', (blocked, restricted) => ({ blocked, restricted }))
export const restrictionsError = createAction('RESTRICTIONS_ERROR')

export const fetchGeoRestrictions = () => (dispatch) => Promise.resolve()
  .then(() => {
    return Faast.fetchRestrictionsByIp()
      .then(({ blocked, restricted }) => dispatch(restrictionsUpdated(blocked, restricted)))
      .catch((e) => {
        log.error(e)
      })
  }) 
