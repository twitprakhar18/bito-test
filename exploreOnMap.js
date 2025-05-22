import React, { useEffect, useRef, useMemo } from "react"
import connect from "common/utils/connect"
import {
  containerStyle,
  headerContainerStyle,
  headingStyle,
  subHeadingStyle,
  highlightFontStyle,
  inputContainerStyle,
  imageStyle,
  collectionContainerStyle,
  collectionWrapperStyle,
  collectionTextStyle,
  logoContainerStyle,
  collectionGradientStyle,
  logoStyle,
  inputStyle,
  rightHeaderStyle,
} from "shared/pages/ExternalAdsCollections/style"
import logo from "common/assets/logo/housing-black.png"
import Image from "common/components/Image"
import pageWrap from "common/utils/pageWrapper"
import trackMap from "shared/pages/ExternalAdsCollections/tracking"
import useTracking from "common/customHooks/useTracking"
import { HT_COLLECTION_BANNER } from "common/constants/pageTypes"
import getData, {
  fetchFeaturedCollectionsAndUpdateCity,
} from "shared/pages/ExternalAdsCollections/fetchData"
import CitySelectDropdown from "common/components/City/CitySelectDropdown"
import useLocalBodyScroll from "common/customHooks/useLocalBodyScroll"
import Carousel, {
  defaultPreviousTemplate,
  defaultNextTemplate,
} from "common/components/Carousel"
import relToAbs from "common/utils/absoluteUrl"
import thirdPartyTracking from "common/utils/thirdPartyTracking"

const ExternalAdsCollections = ({
  isMobile,
  city,
  fetchFeaturedCollectionsAndUpdateCity,
  collections,
  topCities,
}) => {
  useLocalBodyScroll(true)
  const track = useTracking()
  useEffect(() => {
    track("IMPRESSIONS")
    thirdPartyTracking.hindustanTimes()
  }, [])

  let { name: cityName } = city || {}
  const collectionElement = collections.map((item) => (
    <CollectionsRenderer
      data={item}
      isMobile={isMobile}
      track={track}
      key={item.title}
    />
  ))

  const inputContainerRef = useRef(null)

  const handleScroll = () => {
    inputContainerRef.current.click()
  }
  const data = useMemo(
    () => [{ id: "top", label: "Top Cities", list: topCities }],
    [topCities]
  )

  return (
    <div css={containerStyle}>
      <div css={headerContainerStyle}>
        <div css={headingStyle}>
          Featured <span css={highlightFontStyle}>Collections</span>
          {!isMobile && (
            <div css={subHeadingStyle}>Exclusive showcase of top projects</div>
          )}
        </div>
        <div css={rightHeaderStyle}>
          <div ref={inputContainerRef} css={inputContainerStyle}>
            <CitySelectDropdown
              data={data}
              currentCity={city}
              changeCity={fetchFeaturedCollectionsAndUpdateCity}
              placeholder={cityName}
              style={inputStyle}
            />
          </div>
          <Logo track={track} isMobile={isMobile} />
        </div>
      </div>
      {isMobile ? (
        <div onScroll={handleScroll} css={collectionContainerStyle}>
          {collectionElement}
        </div>
      ) : (
        <div css={collectionContainerStyle}>
          <Carousel
            slidesToShow={4}
            slidesToScroll={1}
            startSlide={0}
            centerMode={false}
            isMobile={false}
            freeScroll={false}
            previousTemplate={defaultPreviousTemplate()}
            nextTemplate={defaultNextTemplate()}
          >
            {collectionElement}
          </Carousel>
        </div>
      )}
    </div>
  )
}

const Logo = ({ track, isMobile }) => {
  const onClick = () => {
    track("BANNER_CLICK")
    window.open(
      relToAbs(
        `?utm_source=hindustantimes&utm_medium=affiliate&utm_campaign=ht_${
          isMobile ? "mo" : "dt"
        }_module`
      ),

      "_blank"
    )
  }

  return (
    <div css={logoContainerStyle}>
      <div>Powered by:</div>
      <Image onClick={onClick} lazy={false} src={logo} style={logoStyle} />
    </div>
  )
}

const CollectionsRenderer = ({
  data: { title, image, url } = {},
  isMobile,
  track,
}) => {
  return (
    <div
      onClick={() => {
        track("COLLECTION_CLICK", { collection: title })
        window.open(
          relToAbs(
            `${url}?utm_source=hindustantimes&utm_medium=affiliate&utm_campaign=ht_${
              isMobile ? "mo" : "dt"
            }_module`
          ),

          "_blank"
        )
      }}
      css={collectionWrapperStyle}
    >
      <Image style={imageStyle} src={image} />
      <div css={collectionGradientStyle}>
        <div css={collectionTextStyle}>{title}</div>
      </div>
    </div>
  )
}

const props = ({
  shell: {
    useragent: { isMobile },
  },

  masterData: { cityList: { topCities = [] } = {} },
  filters: { selectedCity = {} } = {},
  meta: { collections = [] },
}) => ({
  isMobile,
  city: selectedCity,
  topCities,
  collections,
})

// cacheTime 1 day
export default pageWrap({
  trackMap,
  getData,
  pageType: HT_COLLECTION_BANNER,
  cacheTime: 86400,
})(
  connect({ props, actions: { fetchFeaturedCollectionsAndUpdateCity } })(
    ExternalAdsCollections
  )
)
