import getFilterKey from "common/utils/filterHelpers/getFilterKey"
import { gql } from "common/utils/gqlTag"

const billBoardQuery = gql`
  fragment PR on Property {
    features {
      label
      description
    }
    coverImage {
      src
      alt
      videoUrl
    }
    showNewLaunch
    imageCount
    propertyType
    title
    subtitle
    isActiveProperty
    galleryTitle
    tracking
    displayPrice {
      value
      displayValue
      unit
      deposit
    }
    address {
      address
      url
      detailedPropertyAddress {
        url
        val
      }
      distanceFromEntity
    }
    polygonsHash
    url
    label
    badge
    listingId
    postedDate
    originalListingId
    promotions
    coords
    tags
    furnishingType
    builtUpArea {
      value
      unit
    }
    sellerCount
    meta
    sellers {
      ...BS
      phone {
        partialValue
      }
      isCertifiedAgent
    }
    emi
    brands {
      name
    }
    details {
      sliceViewUrl
      images {
        images {
          src
          alt
          aspectRatio
        }
      }
      config {
        propertyConfig {
          key
          label
        }
      }
    }
    minDistanceLocality {
      distance
      name
    }
  }
  fragment BS on User {
    name
    id
    image
    firmName
    url
    type
    isPrime
    isPaid
    designation
  }
  fragment DS on User {
    ...BS
    stats {
      label
      description
    }
  }
  query (
    $city: CityInput
    $hash: String!
    $service: String!
    $category: String!
    $isBuy: Boolean!
    $isRent: Boolean!
    $placeholderId: Int
    $filters: JSON!
  ) {
    billboardsData(
      hash: $hash
      service: $service
      category: $category
      city: $city
      placeholderId: $placeholderId
      filters: $filters
    ) {
      promotedProperties @skip(if: $isRent) {
        type
        properties {
          ...PR
          videoConnectAvailable
          micrositeRedirectionURL
          propertyVideoUrl
          propertyVideoThumbnailUrl
        }
      }
      promotedSellers {
        type
        sellers {
          ...DS
          localities {
            name
          }
        }
      }

      rentBillboard @skip(if: $isBuy) {
        sellerId
        properties {
          ...PR
          videoConnectAvailable
          micrositeRedirectionURL
        }
      }
    }
  }
`

const placeholderIdMap = {
  newProjectHighlight: 236,
}

const fetchBillboard =
  (key) =>
  (dispatch, getState, { fetch }) => {
    let {
      filters: {
        selectedCity: city,
        service,
        category,
        [getFilterKey(service, category)]: filters = {},
      },

      routeParams: {
        params: { hash },
      },
    } = getState()
    const product = getFilterKey(service, category)
    if (!hash) {
      return
    }
    // placeholderId is passed as a param from New Project Highlight NP Carousel only
    const placeholderId = placeholderIdMap[key]

    let variables = {
      hash,
      service,
      category,
      city,
      placeholderId,
      isBuy: product === "buy",
      isRent: product === "rent",
      filters,
    }

    let method = "get"

    if (!placeholderId) {
      dispatch({
        type: "SET_BILLBOARD_DATA",
        payload: {
          loaded: false,
        },
      })
    }

    return fetch({
      cancelPrevious: true,
      apiName: placeholderId
        ? "NEW_PROJECT_HIGHLIGHTS"
        : "SEARCH_BILLBOARD_RESULTS",
      cacheType: "stale",
      method,
      controller: placeholderId
        ? "NEW_PROJECT_HIGHLIGHT_DATA"
        : "SEARCH_FETCH_DATA",
      query: {
        query: billBoardQuery,
        variables: JSON.stringify(variables),
      },
    })
      .catch((data) => {
        return data
      })
      .then(
        ({ data: { data: { billboardsData = {} } = {} } = {}, cancelled }) => {
          if (cancelled) {
            return
          }
          let {
            promotedProperties = [],
            promotedSellers = [],
            rentBillboard = [],
          } = billboardsData || {}
          if (rentBillboard && rentBillboard.length) {
            promotedProperties.push({
              type: "rent-billboard",
              rentBillboard,
            })
          }
          if (placeholderId) {
            const { properties } =
              promotedProperties.find(
                ({ type }) => type === "new-project-highlight"
              ) || {}
            const payload = {
              projects: properties,
              hash,
            }

            dispatch({
              type: "UPDATE_META_DATA",
              payload: {
                newProjectHighlight: payload,
              },
            })

            return payload
          } else {
            dispatch({
              type: "SET_BILLBOARD_DATA",
              payload: {
                promotedProperties,
                promotedSellers,
                loaded: true,
              },
            })
          }
        }
      )
  }

export default fetchBillboard
