#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

function parseArgs(argv) {
  const options = { viewport: [], critical: [], ignoreOverflow: [], waitMs: 500, sampleMs: 1000 };
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === "--help" || token === "-h") options.help = true;
    else if (token === "--url") options.url = argv[++index];
    else if (token === "--out") options.out = argv[++index];
    else if (token === "--viewport") options.viewport.push(argv[++index]);
    else if (token === "--critical") options.critical.push(argv[++index]);
    else if (token === "--ignore-overflow") options.ignoreOverflow.push(argv[++index]);
    else if (token === "--wait-ms") options.waitMs = Number(argv[++index]);
    else if (token === "--sample-ms") options.sampleMs = Number(argv[++index]);
    else throw new Error(`Unknown argument: ${token}`);
  }
  return options;
}

function usage() {
  return [
    "Usage: node visual-scan.cjs --url <url> --out <json> [options]",
    "  --viewport <width>x<height>     repeatable, default 1280x720",
    "  --wait-ms <n>                  wait for stable state, default 500",
    "  --sample-ms <n>                key element position sample duration, default 1000",
    "  --critical <selector>          repeatable critical element selector",
    "  --ignore-overflow <selector>   repeatable allowed internal scroll container",
  ].join("\n");
}

function parseViewport(value) {
  const match = /^([1-9]\d*)x([1-9]\d*)$/.exec(value);
  if (!match) throw new Error(`Invalid viewport: ${value}`);
  return { width: Number(match[1]), height: Number(match[2]) };
}

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(path.resolve(file)), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function notRun(out, reason, options) {
  const result = {
    status: "not-run",
    url: options.url || null,
    generatedAt: new Date().toISOString(),
    viewports: [],
    findings: [],
    notRunReason: reason,
  };
  if (out) writeJson(out, result);
  return result;
}

function loadPlaywright() {
  try { return require("playwright"); } catch (firstError) {
    try { return require("@playwright/test"); } catch (secondError) {
      const error = new Error("Playwright package is unavailable in the current project");
      error.cause = { playwright: firstError.message, test: secondError.message };
      throw error;
    }
  }
}

async function scanPage(page, options, viewport) {
  await page.setViewportSize(viewport);
  await page.goto(options.url, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(options.waitMs);
  return page.evaluate(({ critical, ignoreOverflow, sampleMs }) => {
    const visible = (element) => {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return style.visibility !== "hidden" && style.display !== "none" && rect.width > 0 && rect.height > 0;
    };
    const box = (element) => {
      const rect = element.getBoundingClientRect();
      return { x: rect.x, y: rect.y, right: rect.right, bottom: rect.bottom, width: rect.width, height: rect.height };
    };
    const allowed = (element) => ignoreOverflow.some((selector) => {
      try { return element.matches(selector) || element.closest(selector); } catch { return false; }
    });
    const overflow = [];
    for (const element of document.querySelectorAll("body *")) {
      if (!visible(element) || allowed(element)) continue;
      const style = getComputedStyle(element);
      if (style.overflowX === "visible" && element.scrollWidth > element.clientWidth + 2) {
        overflow.push({ selector: element.tagName.toLowerCase(), box: box(element), scrollWidth: element.scrollWidth, clientWidth: element.clientWidth });
      }
    }
    const criticalFindings = [];
    for (const selector of critical) {
      let element;
      try { element = document.querySelector(selector); } catch { criticalFindings.push({ selector, issue: "invalid-selector" }); continue; }
      if (!element || !visible(element)) { criticalFindings.push({ selector, issue: "not-visible" }); continue; }
      const rect = element.getBoundingClientRect();
      const centerX = Math.min(Math.max(rect.left + rect.width / 2, 0), innerWidth - 1);
      const centerY = Math.min(Math.max(rect.top + rect.height / 2, 0), innerHeight - 1);
      const top = document.elementFromPoint(centerX, centerY);
      const covered = top && top !== element && !element.contains(top) && !top.contains(element);
      if (rect.left < 0 || rect.top < 0 || rect.right > innerWidth || rect.bottom > innerHeight) criticalFindings.push({ selector, issue: "outside-viewport", box: box(element) });
      if (covered) criticalFindings.push({ selector, issue: "center-covered", box: box(element), coveringTag: top.tagName.toLowerCase(), coveringClass: top.className || null });
    }
    const collectSamples = () => new Promise((resolve) => {
      const samples = [];
      const started = performance.now();
      const sample = () => {
        const current = { t: Math.round(performance.now() - started), elements: [] };
        for (const selector of critical) {
          let element;
          try { element = document.querySelector(selector); } catch { continue; }
          if (element && visible(element)) current.elements.push({ selector, box: box(element) });
        }
        samples.push(current);
        if (performance.now() - started < sampleMs) requestAnimationFrame(sample);
        else resolve(samples);
      };
      if (sampleMs > 0 && critical.length) requestAnimationFrame(sample);
      else resolve([]);
    });
    return collectSamples().then((samples) => ({ viewport: { width: innerWidth, height: innerHeight }, pageWidth: document.documentElement.scrollWidth, viewportWidth: innerWidth, overflow, criticalFindings, samples }));
  }, { critical: options.critical, ignoreOverflow: options.ignoreOverflow, sampleMs: options.sampleMs });
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) { console.log(usage()); return 0; }
  if (!options.url || !options.out) throw new Error("--url and --out are required");
  const viewports = (options.viewport.length ? options.viewport : ["1280x720"]).map(parseViewport);
  let playwright;
  try { playwright = loadPlaywright(); } catch (error) { notRun(options.out, error.message, options); return 2; }
  const browser = await playwright.chromium.launch({ headless: true });
  const page = await browser.newPage();
  const results = [];
  try {
    for (const viewport of viewports) results.push(await scanPage(page, options, viewport));
  } catch (error) {
    await browser.close();
    writeJson(options.out, { status: "not-run", url: options.url, generatedAt: new Date().toISOString(), viewports: results, findings: [], notRunReason: error.message });
    return 2;
  }
  await browser.close();
  const findings = results.flatMap((result) => [
    ...(result.pageWidth > result.viewportWidth + 2 ? [{ type: "horizontal-overflow", viewport: result.viewport, pageWidth: result.pageWidth, viewportWidth: result.viewportWidth }] : []),
    ...result.overflow.map((item) => ({ type: "overflow-candidate", viewport: result.viewport, ...item })),
    ...result.criticalFindings.map((item) => ({ type: "critical-element", viewport: result.viewport, ...item })),
  ]);
  const status = findings.length ? "review-required" : "passed-candidates";
  writeJson(options.out, { status, url: options.url, generatedAt: new Date().toISOString(), options: { critical: options.critical, ignoreOverflow: options.ignoreOverflow, waitMs: options.waitMs, sampleMs: options.sampleMs }, viewports: results, findings });
  return 0;
}

main().catch((error) => { console.error(error.message); process.exitCode = 2; });
