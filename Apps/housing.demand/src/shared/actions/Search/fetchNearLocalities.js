import codec from 'common/modules/filter-encoder/source/v2/codec'
import { fetchNearByPolyTrends } from 'common/actions/fetchNearbyLocalityPriceTrends'

export const fetchNearLocalities = (priceTrends = false) => (
  dispatch,
  getState
) => {
  let {
    routeParams: {
      params: { hash }
    }
  } = getState()
  if (!hash) {
    return Promise.resolve()
  }
  const { entities = [] } = codec({ hash })
  return dispatch(fetchNearByPolyTrends({ entities })).then(
    nearbyLocalities => {
      dispatch({ type: 'UPDATE_META_DATA', payload: { nearbyLocalities } })
      return nearbyLocalities
    }
  )
}