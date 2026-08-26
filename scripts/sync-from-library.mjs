#!/usr/bin/env node
/**
 * SPA affiliate site ↔ Z9GO library sync (write-back only)
 *
 * GET each ASIN from library; write-back house metadata + local images
 * with imagesMode: replace. Does NOT pull library images into catalog.
 *
 *   Z9GO_LIBRARY_TOKEN=… npm run library:sync
 *   npm run library:sync:dry
 *
 * Configure via env:
 *   SITE_ID (required) e.g. kyasi, adazo, mrcuts, ibamboo
 *   PRODUCT_FILES comma-separated paths relative to repo root
 *     default: src/data/products.ts
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  getAmazonItem,
  health,
  isGoodAmazonImage,
  linkSiteItem,
  upsertAmazonItem,
} from "./lib/kyasi-library.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const SITE_ID = process.env.SITE_ID || "ibamboo";
const PRODUCT_FILES = (process.env.PRODUCT_FILES || "src/data/products.ts,src/data/products.bsr.generated.ts")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const dryRun = process.argv.includes("--dry-run");

function parseProducts(text) {
  const products = [];
  const chunks = text.split(/\n\s*\{\s*\n/);
  for (const block of chunks) {
    const asinM = block.match(/["']?asin["']?\s*:\s*['"]([A-Z0-9]{10})['"]/i);
    if (!asinM) continue;
    const asin = asinM[1].toUpperCase();
    const g = (f) => {
      const m = block.match(
        new RegExp(`["']?${f}["']?\\s*:\\s*['"]([^'"]*)['"]`),
      );
      return m ? m[1] : null;
    };
    const num = (f) => {
      const m = block.match(new RegExp(`["']?${f}["']?\\s*:\\s*([0-9.]+)`));
      return m ? Number(m[1]) : null;
    };
    const slug = g("slug");
    if (slug && slug.startsWith("fill-")) continue;

    let images = [];
    const imgBlock = block.match(/["']?images["']?\s*:\s*\[([\s\S]*?)\]/);
    if (imgBlock) {
      images = [
        ...imgBlock[1].matchAll(
          /https:\/\/[^\s'"\\]+(?:media-amazon|images-amazon|ssl-images-amazon)[^\s'"\\]*/g,
        ),
      ].map((m) => m[0].replace(/['"\\]+$/, ""));
      images = [...new Set(images)];
    }
    const single = g("image");
    if (single && !images.length) images = [single];

    products.push({
      id: g("id"),
      slug,
      name: g("name"),
      brand: g("brand"),
      category: g("category"),
      tagline: g("tagline"),
      asin,
      priceHint: num("priceHint"),
      rating: num("rating"),
      reviewCount: num("reviewCount"),
      images,
      limitedTime: /limitedTime:\s*true/.test(block),
    });
  }
  return products;
}

function loadAll() {
  const byAsin = new Map();
  for (const rel of PRODUCT_FILES) {
    const path = join(root, rel);
    if (!existsSync(path)) {
      console.warn("skip missing", rel);
      continue;
    }
    const list = parseProducts(readFileSync(path, "utf8"));
    console.log("loaded", list.length, "from", rel);
    for (const p of list) {
      if (!p.asin) continue;
      if (!byAsin.has(p.asin)) byAsin.set(p.asin, p);
    }
  }
  return [...byAsin.values()];
}

async function main() {
  if (!SITE_ID || SITE_ID.startsWith("__")) {
    throw new Error("SITE_ID not configured in sync-from-library.mjs");
  }
  console.log(dryRun ? "=== DRY RUN ===" : "=== SYNC ===");
  console.log("site:", SITE_ID);
  console.log("mode: write-back only (no library→catalog image upgrades)");

  const h = await health();
  console.log("library:", h.app, h.host || "", h.ok ? "ok" : h);

  const products = loadAll();
  console.log("unique ASINs:", products.length);

  const stats = {
    libraryHit: 0,
    libraryMiss: 0,
    writtenBack: 0,
    linked: 0,
    errors: 0,
  };
  const report = [];

  for (const p of products) {
    const asin = p.asin;
    let lib = null;
    try {
      lib = await getAmazonItem(asin);
    } catch (e) {
      stats.errors++;
      console.error("GET fail", asin, e.message);
      continue;
    }
    if (lib) stats.libraryHit++;
    else stats.libraryMiss++;

    const writeImages = (p.images || []).filter(Boolean).slice(0, 8);
    report.push({
      id: p.id || p.slug,
      asin,
      library: lib ? "hit" : "miss",
      images: writeImages.length,
      good: writeImages.filter(isGoodAmazonImage).length,
    });

    if (dryRun) continue;

    try {
      await upsertAmazonItem({
        asin,
        title: p.name,
        brand: p.brand || null,
        images: writeImages,
        imagesMode: "replace",
        price: p.priceHint ?? null,
        rating: p.rating ?? null,
        reviewCount: p.reviewCount ?? null,
        fetchStatus: writeImages.some(isGoodAmazonImage) ? "ok" : "partial",
        attributes: {
          [`${SITE_ID}Id`]: p.id,
          category: p.category,
          slug: p.slug,
        },
      });
      stats.writtenBack++;
      await linkSiteItem({
        siteId: SITE_ID,
        asin,
        slug: p.slug || p.id,
        houseName: p.name,
        category: p.category,
        tagline: p.tagline,
        limitedTime: !!p.limitedTime,
      });
      stats.linked++;
    } catch (e) {
      stats.errors++;
      console.error("WRITE fail", asin, e.message);
    }
    await new Promise((r) => setTimeout(r, 30));
  }

  mkdirSync(join(root, "tmp"), { recursive: true });
  writeFileSync(
    join(root, "tmp/library-sync-report.json"),
    JSON.stringify({ stats, report, at: new Date().toISOString() }, null, 2),
  );
  console.log("\n--- stats ---");
  console.log(stats);
  console.log("report → tmp/library-sync-report.json");
  if (stats.errors) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
