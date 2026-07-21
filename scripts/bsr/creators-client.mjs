import { loadEnvFile } from 'node:process'

const API_BASE_URL = 'https://creatorsapi.amazon'
const DEFAULT_RESOURCES = [
  'browseNodeInfo.browseNodes.salesRank',
  'browseNodeInfo.websiteSalesRank',
  'images.primary.large',
  'images.variants.large',
  'itemInfo.byLineInfo',
  'itemInfo.features',
  'itemInfo.productInfo',
  'itemInfo.title',
  'offersV2.listings.availability',
  'offersV2.listings.dealDetails',
  'offersV2.listings.isBuyBoxWinner',
  'offersV2.listings.price',
]

const TOKEN_ENDPOINTS = {
  '2.1': 'https://creatorsapi.auth.us-east-1.amazoncognito.com/oauth2/token',
  '2.2': 'https://creatorsapi.auth.eu-south-2.amazoncognito.com/oauth2/token',
  '2.3': 'https://creatorsapi.auth.us-west-2.amazoncognito.com/oauth2/token',
  '3.1': 'https://api.amazon.com/auth/o2/token',
  '3.2': 'https://api.amazon.co.uk/auth/o2/token',
  '3.3': 'https://api.amazon.co.jp/auth/o2/token',
}

let tokenCache

export function loadCreatorsEnv(envPath) {
  try {
    loadEnvFile(envPath)
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error
  }
}

function creatorsConfig(overrides = {}) {
  const config = {
    credentialId:
      overrides.credentialId || process.env.AMAZON_CREATORS_CREDENTIAL_ID,
    credentialSecret:
      overrides.credentialSecret ||
      process.env.AMAZON_CREATORS_CREDENTIAL_SECRET,
    credentialVersion:
      overrides.credentialVersion ||
      process.env.AMAZON_CREATORS_CREDENTIAL_VERSION ||
      '3.1',
    partnerTag:
      overrides.partnerTag ||
      process.env.AMAZON_CREATORS_PARTNER_TAG ||
      process.env.VITE_AMAZON_ASSOCIATE_TAG,
    marketplace:
      overrides.marketplace ||
      process.env.AMAZON_CREATORS_MARKETPLACE ||
      'www.amazon.com',
  }

  const missing = Object.entries(config)
    .filter(([, value]) => !value)
    .map(([key]) => key)
  if (missing.length) {
    throw new Error(
      `Missing Amazon Creators API configuration: ${missing.join(', ')}`,
    )
  }
  if (!TOKEN_ENDPOINTS[config.credentialVersion]) {
    throw new Error(
      `Unsupported Amazon Creators credential version ${config.credentialVersion}`,
    )
  }
  return config
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function fetchJson(url, options, { retries = 3 } = {}) {
  for (let attempt = 0; ; attempt += 1) {
    const response = await fetch(url, {
      ...options,
      signal: AbortSignal.timeout(30_000),
    })
    const text = await response.text()
    let data
    try {
      data = text ? JSON.parse(text) : {}
    } catch {
      data = { message: text }
    }

    if (response.ok) return data
    const retryable = response.status === 429 || response.status >= 500
    if (!retryable || attempt >= retries) {
      const message =
        data?.errors?.map((error) => error.message || error.code).join('; ') ||
        data?.error_description ||
        data?.message ||
        data?.error ||
        `HTTP ${response.status}`
      const error = new Error(
        `Amazon Creators API ${response.status}: ${message}`,
      )
      error.status = response.status
      error.body = data
      throw error
    }
    const retryAfter = Number(response.headers.get('retry-after'))
    await sleep(
      Number.isFinite(retryAfter) && retryAfter > 0
        ? retryAfter * 1000
        : 500 * 2 ** attempt,
    )
  }
}

async function requestAccessToken(config, forceRefresh = false) {
  const now = Date.now()
  if (
    !forceRefresh &&
    tokenCache?.credentialId === config.credentialId &&
    tokenCache.expiresAt > now + 60_000
  ) {
    return tokenCache.accessToken
  }

  const version = config.credentialVersion
  const isV3 = version.startsWith('3.')
  const body = isV3
    ? JSON.stringify({
        grant_type: 'client_credentials',
        client_id: config.credentialId,
        client_secret: config.credentialSecret,
        scope: 'creatorsapi::default',
      })
    : new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: config.credentialId,
        client_secret: config.credentialSecret,
        scope: 'creatorsapi/default',
      }).toString()

  const data = await fetchJson(TOKEN_ENDPOINTS[version], {
    method: 'POST',
    headers: {
      'Content-Type': isV3
        ? 'application/json'
        : 'application/x-www-form-urlencoded',
    },
    body,
  })
  if (!data.access_token) {
    throw new Error('Amazon Creators token response did not include access_token')
  }

  tokenCache = {
    credentialId: config.credentialId,
    accessToken: data.access_token,
    expiresAt: now + Number(data.expires_in || 3600) * 1000,
  }
  return tokenCache.accessToken
}

async function callCatalog(config, operation, payload, retryAuth = true) {
  const accessToken = await requestAccessToken(config)
  try {
    return await fetchJson(`${API_BASE_URL}/catalog/v1/${operation}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'x-marketplace': config.marketplace,
      },
      body: JSON.stringify({
        marketplace: config.marketplace,
        partnerTag: config.partnerTag,
        ...payload,
      }),
    })
  } catch (error) {
    if (retryAuth && error.status === 401) {
      tokenCache = undefined
      await requestAccessToken(config, true)
      return callCatalog(config, operation, payload, false)
    }
    throw error
  }
}

export function createCreatorsClient(overrides = {}) {
  const config = creatorsConfig(overrides)

  return {
    config: {
      credentialVersion: config.credentialVersion,
      marketplace: config.marketplace,
      partnerTag: config.partnerTag,
    },

    async getAccessToken() {
      return requestAccessToken(config)
    },

    async getItems(asins, { resources = DEFAULT_RESOURCES } = {}) {
      const uniqueAsins = [...new Set(asins.filter(Boolean))]
      const items = []
      const errors = []

      for (let offset = 0; offset < uniqueAsins.length; offset += 10) {
        const itemIds = uniqueAsins.slice(offset, offset + 10)
        const data = await callCatalog(config, 'getItems', {
          itemIds,
          itemIdType: 'ASIN',
          resources,
        })
        items.push(...(data.itemsResult?.items || []))
        errors.push(...(data.errors || []))
      }

      return { items, errors }
    },
  }
}

function displayValue(value) {
  return value?.displayValue ?? value?.displayValues?.[0]
}

export function mapCreatorsItem(item, fallback = {}) {
  const itemInfo = item.itemInfo || {}
  const productInfo = itemInfo.productInfo || {}
  const imageCandidates = [
    item.images?.primary?.large?.url,
    item.images?.primary?.hiRes?.url,
    ...(item.images?.variants || []).flatMap((variant) => [
      variant?.large?.url,
      variant?.hiRes?.url,
    ]),
  ].filter(Boolean)
  const listing =
    item.offersV2?.listings?.find((offer) => offer.isBuyBoxWinner) ||
    item.offersV2?.listings?.[0]
  const browseNodes = item.browseNodeInfo?.browseNodes || []
  const bsrLines = browseNodes
    .filter((node) => Number(node.salesRank) > 0)
    .map((node) => ({
      rank: Number(node.salesRank),
      category: node.contextFreeName || node.displayName,
    }))
  if (item.browseNodeInfo?.websiteSalesRank?.salesRank) {
    bsrLines.push({
      rank: Number(item.browseNodeInfo.websiteSalesRank.salesRank),
      category:
        item.browseNodeInfo.websiteSalesRank.contextFreeName ||
        item.browseNodeInfo.websiteSalesRank.displayName ||
        'Amazon',
    })
  }

  const specs = Object.entries(productInfo)
    .map(([key, value]) => ({
      label: value?.label || key.replace(/([a-z])([A-Z])/g, '$1 $2'),
      value: displayValue(value),
    }))
    .filter((spec) => spec.value != null && String(spec.value).trim())
    .map((spec) => ({ ...spec, value: String(spec.value) }))

  const material =
    displayValue(productInfo.material) ||
    specs.find((spec) => spec.label.toLowerCase() === 'material')?.value ||
    (/bamboo/i.test(displayValue(itemInfo.title) || '')
      ? 'Bamboo'
      : 'See listing')

  return {
    asin: item.asin,
    title: displayValue(itemInfo.title) || fallback.title,
    images: [...new Set(imageCandidates)].slice(0, 6),
    price: listing?.price?.money?.amount,
    listPrice: listing?.price?.savingBasis?.money?.amount,
    rating:
      item.customerReviews?.starRating?.value ??
      item.customerReviews?.starRating ??
      fallback.rating,
    reviewCount:
      item.customerReviews?.count ??
      item.customerReviews?.reviewCount ??
      fallback.reviewCount,
    brand:
      displayValue(itemInfo.byLineInfo?.brand) ||
      displayValue(itemInfo.byLineInfo?.manufacturer),
    features: itemInfo.features?.displayValues || [],
    specs,
    material,
    bsrLines: bsrLines.slice(0, 6),
    productUrl: item.detailPageURL,
  }
}

export { DEFAULT_RESOURCES }
