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
    else if (token === "--config") options.config = argv[++index];
    else if (token === "--screenshots-dir") options.screenshotsDir = argv[++index];
    else if (token === "--page") options.pageName = argv[++index];
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
    "       node visual-scan.cjs --config <matrix.json> --out <json> [options]",
    "  --config <file>                page x state x viewport matrix JSON",
    "  --page <name>                  run only one named matrix page",
    "  --viewport <width>x<height>     repeatable, default 1280x720",
    "  --wait-ms <n>                  wait for stable state, default 500",
    "  --sample-ms <n>                key element position sample duration, default 1000",
    "  --critical <selector>          repeatable critical element selector",
    "  --ignore-overflow <selector>   repeatable allowed internal scroll container",
    "  --screenshots-dir <dir>        save screenshots for review-required findings",
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

function loadConfig(file) {
  const value = JSON.parse(fs.readFileSync(file, "utf8"));
  if (!value || !Array.isArray(value.pages) || value.pages.length === 0) {
    throw new Error("Config must contain a non-empty pages array");
  }
  return value.pages;
}

function safeName(value) {
  return String(value || "page").replace(/[^a-z0-9._-]+/gi, "-").replace(/^-+|-+$/g, "") || "page";
}

async function scanPage(page, options, viewport, screenshotPath) {
  await page.setViewportSize(viewport);
  await page.goto(options.url, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(options.waitMs);
  const result = await page.evaluate(async ({ critical, ignoreOverflow, sampleMs }) => {
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
    const textClippingFindings = [];
    const textTargets = document.querySelectorAll("input, textarea, select, button, label, [role=combobox], [role=button], .el-form-item__label, .el-select__selected-item, .el-input__inner");
    const textOf = (element) => {
      if ("value" in element && element.value) return element.value;
      const selected = element.querySelector?.("option:checked, .el-select__selected-item");
      return (selected?.textContent || element.getAttribute("aria-label") || element.textContent || element.getAttribute("placeholder") || "").replace(/\s+/g, " ").trim();
    };
    const selectorOf = (element) => {
      const classes = typeof element.className === "string" ? element.className.trim().split(/\s+/).filter(Boolean).slice(0, 2) : [];
      return `${element.tagName.toLowerCase()}${classes.map((item) => `.${CSS.escape(item)}`).join("")}`;
    };
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    for (const element of textTargets) {
      if (!visible(element)) continue;
      const text = textOf(element);
      if (!text) continue;
      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      const padding = parseFloat(style.paddingLeft || "0") + parseFloat(style.paddingRight || "0");
      if (context) context.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
      const measured = context ? context.measureText(text).width : 0;
      const available = Math.max(0, rect.width - padding - 2);
      const clipped = element.scrollWidth > element.clientWidth + 1 || measured > available + 1;
      if (clipped) textClippingFindings.push({ selector: selectorOf(element), issue: "text-clipping-candidate", text: text.slice(0, 120), box: box(element), measuredTextWidth: Math.round(measured * 100) / 100, availableWidth: Math.round(available * 100) / 100, scrollWidth: element.scrollWidth, clientWidth: element.clientWidth, textOverflow: style.textOverflow, overflow: style.overflow });
    }
    let cls = 0;
    let clsSessionValue = 0;
    let clsSessionStart = 0;
    let clsLastTime = 0;
    let clsEntries = 0;
    let layoutObserver;
    try {
      layoutObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.hadRecentInput) continue;
          const time = entry.startTime;
          if (!clsSessionStart || time - clsLastTime > 1000 || time - clsSessionStart > 5000) {
            clsSessionStart = time;
            clsSessionValue = entry.value;
          } else {
            clsSessionValue += entry.value;
          }
          cls = Math.max(cls, clsSessionValue);
          clsLastTime = time;
          clsEntries += 1;
        }
      });
      layoutObserver.observe({ type: "layout-shift", buffered: true });
    } catch {
      layoutObserver = null;
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
    return collectSamples().then((samples) => {
      layoutObserver?.disconnect();
      return { viewport: { width: innerWidth, height: innerHeight }, pageWidth: document.documentElement.scrollWidth, viewportWidth: innerWidth, overflow, criticalFindings, textClippingFindings, samples, cls, clsEntries };
    });
  }, { critical: options.critical, ignoreOverflow: options.ignoreOverflow, sampleMs: options.sampleMs });
  const hasCandidate = result.pageWidth > result.viewportWidth + 2 || result.overflow.length > 0 || result.criticalFindings.length > 0 || result.textClippingFindings.length > 0;
  if (screenshotPath && hasCandidate) {
    fs.mkdirSync(path.dirname(path.resolve(screenshotPath)), { recursive: true });
    await page.screenshot({ path: screenshotPath, fullPage: true, scale: "css" });
    result.screenshot = screenshotPath;
  }
  return result;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) { console.log(usage()); return 0; }
  if ((!options.url && !options.config) || !options.out) throw new Error("--url or --config, and --out are required");
  const matrixPages = options.config ? loadConfig(options.config) : [{ name: "page", url: options.url, viewports: options.viewport }];
  const selectedPages = options.pageName ? matrixPages.filter((page) => page.name === options.pageName) : matrixPages;
  if (!selectedPages.length) throw new Error(`No matrix page matched: ${options.pageName}`);
  let playwright;
  try { playwright = loadPlaywright(); } catch (error) { notRun(options.out, error.message, options); return 2; }
  const browser = await playwright.chromium.launch({ headless: true });
  const page = await browser.newPage();
  const results = [];
  try {
    for (const matrixPage of selectedPages) {
      const pageOptions = { ...options, ...matrixPage, url: matrixPage.url || options.url, critical: matrixPage.critical || options.critical, ignoreOverflow: matrixPage.ignoreOverflow || options.ignoreOverflow, waitMs: matrixPage.waitMs ?? options.waitMs, sampleMs: matrixPage.sampleMs ?? options.sampleMs };
      const viewports = (matrixPage.viewports?.length ? matrixPage.viewports : (options.viewport.length ? options.viewport : ["1280x720"])).map((value) => typeof value === "string" ? parseViewport(value) : value);
      for (const viewport of viewports) {
        const id = `${safeName(matrixPage.name)}-${viewport.width}x${viewport.height}`;
        results.push({ page: matrixPage.name || "page", state: matrixPage.state || null, ...(await scanPage(page, pageOptions, viewport, options.screenshotsDir ? path.join(options.screenshotsDir, `${id}.png`) : null)) });
      }
    }
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
    ...result.textClippingFindings.map((item) => ({ type: "text-clipping-candidate", viewport: result.viewport, ...item })),
  ]);
  const status = findings.length ? "review-required" : "passed-candidates";
  writeJson(options.out, { status, url: options.url || null, config: options.config || null, generatedAt: new Date().toISOString(), options: { critical: options.critical, ignoreOverflow: options.ignoreOverflow, waitMs: options.waitMs, sampleMs: options.sampleMs, screenshotsDir: options.screenshotsDir || null }, viewports: results, findings });
  return 0;
}

main().catch((error) => { console.error(error.message); process.exitCode = 2; });
