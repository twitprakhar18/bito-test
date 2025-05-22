import connect from 'common/utils/connect'
import loadable from 'common/utils/loadable'
import React from 'react'
import useLocality from 'common/components/ExploreNeighbourhood/useLocality'
import trackMap from 'shared/pages/Dedicated/common/tracking'
import pageWrap from 'common/utils/pageWrapper'
import reducer from 'shared/pages/Dedicated/common/reducer'
import { DEDICATED } from 'common/constants/pageTypes'
import NeighbourhoodTemplate from 'common/components/ExploreNeighbourhood/Container/loader'
const lazyGetData = () => import('shared/pages/Dedicated/common/fetchData')

let ModalComponent = loadable(
  () =>
    import(
      /* webpackChunkName: "Demand/ExploreOnMap/index/ExploreNeighbourhood/Container" */ 'common/components/ExploreNeighbourhood/Container'
    ),

  { silent: false, ssr: false }
)

const ExploreOnMap = ({ details, isBot }) => {
  const { coords } = details || {}

  const [modalLoaded, filteredData] = useLocality(coords, { isBot })
  const fallback = <NeighbourhoodTemplate />
  if (!modalLoaded) {
    return fallback
  }
  return (
    <ModalComponent
      fallback={fallback}
      mapClick={false}
      coords={coords}
      showHeader={false}
      filteredData={filteredData}
      details={details}
    />
  )
}
let props = ({
  shell: {
    useragent: { isBot }
  },

  propertyDetails: { details = {} } = {}
}) => ({
  details,
  isBot
})

// cacheTime 3 hours
export default pageWrap({
  lazyGetData,
  reducer,
  trackMap,
  pageType: DEDICATED,
  scrollToTop: true,
  cacheTime: 86400
})(connect({ props })(ExploreOnMap))
