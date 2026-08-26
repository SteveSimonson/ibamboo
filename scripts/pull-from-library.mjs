#!/usr/bin/env node
/**
 * Pull Z9GO gated catalog → sidecar for curated shop URL health.
 *
 * Z9GO is source of truth for active curated SKUs. Does NOT rewrite
 * products.ts (enrichment stays). Does NOT touch BSR weekly files.
 * Does not store Associate tags.
 *
 *   Z9GO_LIBRARY_TOKEN=… npm run library:pull
 *   npm run library:pull:dry
 *
 *   SITE_ID                 default ibamboo
 *   Z9GO_UNKNOWN_POLICY     include (ramp) | exclude
 *   --unknown=exclude
 *   --dry-run               report only (no sidecar write)
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { health, listSiteCatalogAll } from "./lib/kyasi-library.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const SITE_ID = process.env.SITE_ID || "ibamboo";
const CURATED_FILE = "src/data/products.ts";
const GATE_REL = "src/data/z9go-gate.json";
const REPORT_REL = "tmp/library-pull-report.json";

const dryRun = process.argv.includes("--dry-run");

function argValue(name) {
  const prefix = `${name}=`;
  const hit = process.argv.find((a) => a.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : undefined;
}

function unknownPolicy() {
  const raw =
    argValue("--unknown") || process.env.Z9GO_UNKNOWN_POLICY || "include";
  return raw === "exclude" ? "exclude" : "include";
}

/** Same ASIN parse as sync-from-library.mjs (`"asin": "B0XXXXXXXX"` JSON style). */
function parseProductAsins(text) {
  const asins = [];
  const chunks = text.split(/\n\s*\{\s*\n/);
  for (const block of chunks) {
    const asinM = block.match(/["']?asin["']?\s*:\s*['"]([A-Z0-9]{10})['"]/i);
    if (!asinM) continue;
    const g = (f) => {
      const m = block.match(
        new RegExp(`["']?${f}["']?\\s*:\\s*['"]([^'"]*)['"]`),
      );
      return m ? m[1] : null;
    };
    const slug = g("slug");
    if (slug && slug.startsWith("fill-")) continue;
    asins.push(asinM[1].toUpperCase());
  }
  return [...new Set(asins)];
}

function loadLocalCuratedAsins() {
  const path = join(root, CURATED_FILE);
  if (!existsSync(path)) {
    console.warn("skip missing", CURATED_FILE);
    return [];
  }
  const list = parseProductAsins(readFileSync(path, "utf8"));
  console.log("loaded", list.length, "curated ASINs from", CURATED_FILE);
  return list;
}

function catalogAsin(item) {
  const raw = item?.externalId || item?.asin || "";
  const asin = String(raw).trim().toUpperCase();
  return /^[A-Z0-9]{10}$/.test(asin) ? asin : null;
}

async function main() {
  if (!SITE_ID || SITE_ID.startsWith("__")) {
    throw new Error("SITE_ID not configured in pull-from-library.mjs");
  }
  const policy = unknownPolicy();
  console.log(dryRun ? "=== DRY RUN ===" : "=== PULL ===");
  console.log("site:", SITE_ID);
  console.log("unknown:", policy);
  console.log("mode: gated catalog sidecar (no products.ts rewrite, BSR fenced)");

  const h = await health();
  console.log("library:", h.app, h.host || "", h.ok ? "ok" : h);

  const catalog = await listSiteCatalogAll(SITE_ID, { unknown: policy });
  const libraryAsins = [
    ...new Set(catalog.items.map(catalogAsin).filter(Boolean)),
  ].sort();
  const librarySet = new Set(libraryAsins);
  const localCurated = loadLocalCuratedAsins().sort();
  const localSet = new Set(localCurated);

  const keep = localCurated.filter((a) => librarySet.has(a));
  const hide = localCurated.filter((a) => !librarySet.has(a));
  const inbound = libraryAsins.filter((a) => !localSet.has(a));

  const fetchedAt = new Date().toISOString();
  const report = {
    siteId: SITE_ID,
    unknownPolicy: policy,
    fetchedAt,
    dryRun,
    libraryActive: libraryAsins.length,
    localCurated: localCurated.length,
    keep,
    hide,
    inbound,
    catalogTotal: catalog.total,
    catalogReturned: catalog.returned,
  };

  mkdirSync(join(root, "tmp"), { recursive: true });
  writeFileSync(join(root, REPORT_REL), JSON.stringify(report, null, 2));

  console.log("\n--- pull ---");
  console.log("libraryActive:", report.libraryActive);
  console.log("localCurated:", report.localCurated);
  console.log("keep:", keep.length);
  console.log("hide:", hide.length, hide.length ? hide.join(",") : "");
  console.log(
    "inbound:",
    inbound.length,
    inbound.length ? inbound.join(",") : "(none — v1 lists only, does not add rows)",
  );
  console.log("report →", REPORT_REL);

  if (dryRun) {
    console.log("dry-run: sidecar not written");
    return;
  }

  const gate = {
    enabled: true,
    siteId: SITE_ID,
    unknownPolicy: policy,
    fetchedAt,
    asins: libraryAsins,
    source: "z9go-catalog",
  };
  writeFileSync(join(root, GATE_REL), `${JSON.stringify(gate, null, 2)}\n`);
  console.log("sidecar →", GATE_REL);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
