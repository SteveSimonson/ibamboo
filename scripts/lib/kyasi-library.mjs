/**
 * Client for the federated product library at z9go.com
 * Reads and writes need a token. Z9GO_LIBRARY_* preferred; KYASI_LIBRARY_* still works.
 */
const DEFAULT_BASE =
  process.env.Z9GO_LIBRARY_URL ||
  process.env.KYASI_LIBRARY_URL ||
  "https://z9go.com";

export function libraryBase() {
  return DEFAULT_BASE.replace(/\/+$/, "");
}

export function libraryToken() {
  return (
    process.env.Z9GO_LIBRARY_TOKEN ||
    process.env.KYASI_LIBRARY_TOKEN ||
    process.env.ADMIN_API_TOKEN ||
    ""
  ).trim();
}

async function req(path, opts = {}) {
  const url = `${libraryBase()}${path}`;
  const headers = {
    Accept: "application/json",
    ...(opts.headers || {}),
  };
  if (opts.json) {
    headers["Content-Type"] = "application/json";
  }
  const token = libraryToken();
  // All library APIs are auth-gated (session or Bearer). Machine clients use Bearer.
  if (opts.auth !== false) {
    if (!token) {
      throw new Error(
        "KYASI_LIBRARY_TOKEN (or ADMIN_API_TOKEN) required for library access",
      );
    }
    headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(url, {
    method: opts.method || "GET",
    headers,
    body: opts.json ? JSON.stringify(opts.json) : undefined,
  });
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }
  if (!res.ok) {
    const msg =
      (data && (data.error || data.message)) ||
      `${res.status} ${res.statusText}`;
    const err = new Error(`z9go library ${opts.method || "GET"} ${path}: ${msg}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

/** Prefer real gallery CDN URLs over fragile images/P/{ASIN} pattern */
export function isGoodAmazonImage(url) {
  if (!url || typeof url !== "string") return false;
  if (/images\/P\//i.test(url)) return false;
  return /media-amazon\.com\/images\/I\//i.test(url) ||
    /ssl-images-amazon\.com\/images\//i.test(url);
}

export function pickPrimaryImage(images, fallback) {
  const list = Array.isArray(images) ? images : [];
  const good = list.find(isGoodAmazonImage);
  if (good) return good;
  if (isGoodAmazonImage(fallback)) return fallback;
  return good || fallback || list[0] || null;
}

export async function getAmazonItem(asin) {
  if (!asin) return null;
  try {
    const data = await req(
      `/api/library/items/amazon/${encodeURIComponent(asin.toUpperCase())}`,
    );
    return data.item || null;
  } catch (e) {
    if (e.status === 404) return null;
    throw e;
  }
}

export async function listSiteItems(siteId, limit = 100) {
  const data = await req(
    `/api/library/items?site=${encodeURIComponent(siteId)}&limit=${limit}`,
  );
  return data;
}

const CATALOG_LIMIT_MAX = 250;
const CATALOG_LIMIT_DEFAULT = 100;

function catalogLimit(n) {
  const v = Number(n);
  if (!Number.isFinite(v)) return CATALOG_LIMIT_DEFAULT;
  return Math.min(CATALOG_LIMIT_MAX, Math.max(1, Math.floor(v)));
}

function catalogOffset(n) {
  const v = Number(n);
  if (!Number.isFinite(v) || v < 0) return 0;
  return Math.floor(v);
}

function catalogUnknown(policy) {
  return policy === "exclude" ? "exclude" : "include";
}

/**
 * Gated merchandisable catalog for a site.
 * GET /api/library/sites/:siteId/catalog?unknown=&limit=&offset=
 * Items are active site_items with fetch_status ok/partial (and unknown when
 * policy=include). Never blocked.
 */
export async function listSiteCatalog(
  siteId,
  { unknown = "include", limit = CATALOG_LIMIT_DEFAULT, offset = 0 } = {},
) {
  const params = new URLSearchParams({
    unknown: catalogUnknown(unknown),
    limit: String(catalogLimit(limit)),
    offset: String(catalogOffset(offset)),
  });
  return req(
    `/api/library/sites/${encodeURIComponent(siteId)}/catalog?${params}`,
  );
}

/** Page catalog until a short page or offset covers total. */
export async function listSiteCatalogAll(siteId, { unknown = "include" } = {}) {
  const limit = CATALOG_LIMIT_DEFAULT;
  const policy = catalogUnknown(unknown);
  const items = [];
  let offset = 0;
  let total = Infinity;
  let last = null;
  let pages = 0;
  while (offset < total) {
    if (++pages > 500) break;
    const page = await listSiteCatalog(siteId, {
      unknown: policy,
      limit,
      offset,
    });
    last = page;
    const batch = Array.isArray(page?.items) ? page.items : [];
    items.push(...batch);
    if (typeof page?.total === "number" && Number.isFinite(page.total)) {
      total = page.total;
    } else {
      total = offset + batch.length;
    }
    offset += batch.length;
    if (batch.length < limit) break;
  }
  return {
    siteId: last?.siteId ?? siteId,
    siteName: last?.siteName,
    policy: last?.policy ?? policy,
    items,
    total: typeof last?.total === "number" ? last.total : items.length,
    returned: items.length,
  };
}

export async function upsertAmazonItem(input) {
  return req("/api/library/items", {
    method: "POST",
    auth: true,
    json: {
      networkId: "amazon",
      externalId: input.asin,
      marketplace: "www.amazon.com",
      title: input.title,
      brand: input.brand,
      images: input.images || [],
      /** Catalog is source of truth — never merge polluted library galleries */
      imagesMode: input.imagesMode || "replace",
      price: input.price ?? null,
      rating: input.rating ?? null,
      reviewCount: input.reviewCount ?? null,
      fetchStatus: input.fetchStatus,
      attributes: input.attributes || {},
    },
  });
}

export async function linkSiteItem(input) {
  return req("/api/library/site-items", {
    method: "POST",
    auth: true,
    json: {
      siteId: input.siteId,
      networkId: "amazon",
      externalId: input.asin,
      marketplace: "www.amazon.com",
      slug: input.slug,
      houseName: input.houseName,
      category: input.category,
      tagline: input.tagline,
      status: input.status || "active",
      limitedTime: !!input.limitedTime,
      period: input.period || null,
    },
  });
}

export async function health() {
  return req("/api/health", { auth: false });
}
