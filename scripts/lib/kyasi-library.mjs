/**
 * Client for the federated product library at kyasi.us
 * Reads are public. Writes need KYASI_LIBRARY_TOKEN (ADMIN_API_TOKEN).
 */
const DEFAULT_BASE =
  process.env.KYASI_LIBRARY_URL || "https://kyasi.us";

export function libraryBase() {
  return DEFAULT_BASE.replace(/\/+$/, "");
}

export function libraryToken() {
  return (
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
  if (opts.auth) {
    if (!token) {
      throw new Error(
        "KYASI_LIBRARY_TOKEN (or ADMIN_API_TOKEN) required for library writes",
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
    const err = new Error(`kyasi library ${opts.method || "GET"} ${path}: ${msg}`);
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
  return req("/api/health");
}
