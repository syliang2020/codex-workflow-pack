const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

// 仅替换浏览器边界来核对启动选择与失败策略；DOM 扫描另用真实 Chrome 验证。
async function runScanner({ flags = [], launchError, missingDependency = false } = {}) {
  const outputRoot = path.resolve(__dirname, "../../../../.tmp/browser-policy-tests");
  fs.mkdirSync(outputRoot, { recursive: true });
  const runDirectory = fs.mkdtempSync(path.join(outputRoot, "run-"));
  const output = path.join(runDirectory, "scan.json");
  const launches = [];
  const engines = [];
  const processState = { argv: ["node", "visual-scan.cjs", "--url", "http://localhost/test", "--out", output, ...flags], exitCode: 0 };
  const page = {
    async setViewportSize() {},
    async goto() {},
    async waitForTimeout() {},
    async evaluate() {
      return { viewport: { width: 1280, height: 720 }, pageWidth: 1280, viewportWidth: 1280, overflow: [], criticalFindings: [], textClippingFindings: [], samples: [], cls: 0, clsEntries: 0 };
    },
  };
  const browser = { async newPage() { return page; }, async close() {} };
  const playwright = Object.fromEntries(["chromium", "firefox", "webkit"].map(engine => [engine, { async launch(options) {
    launches.push(options);
    engines.push(engine);
    if (launchError) throw new Error(launchError);
    return browser;
  } }]));
  const context = {
    require(name) {
      if (name === "playwright" || name === "@playwright/test") {
        if (missingDependency) throw new Error("Package unavailable");
        return playwright;
      }
      return require(name);
    },
    process: processState,
    console: { log() {}, error() {} },
  };
  await vm.runInNewContext(fs.readFileSync(path.join(__dirname, "visual-scan.cjs"), "utf8"), context);
  return { launches, engines, exitCode: processState.exitCode, result: fs.existsSync(output) ? JSON.parse(fs.readFileSync(output, "utf8")) : null };
}

test("默认通过 Playwright 新开可见的 Google Chrome，并记录浏览器配置", async () => {
  const run = await runScanner();
  assert.equal(run.launches.length, 1);
  assert.equal(run.launches[0].channel, "chrome");
  assert.equal(run.launches[0].headless, false);
  assert.equal(run.result.browser.channel, "chrome");
  assert.equal(run.result.browser.headless, false);
});

test("只有显式 --headless 才改为无界面 Chrome", async () => {
  const run = await runScanner({ flags: ["--headless"] });
  assert.equal(run.exitCode, 0);
  assert.equal(run.launches[0].channel, "chrome");
  assert.equal(run.launches[0].headless, true);
  assert.equal(run.result.browser.headless, true);
});

test("Chrome 启动失败保留 not-run 结果并返回非零退出码，不尝试其他浏览器", async () => {
  const run = await runScanner({ launchError: "Chrome is unavailable" });
  assert.equal(run.launches.length, 1);
  assert.equal(run.result?.status, "not-run");
  assert.match(run.result.notRunReason, /Chrome is unavailable/);
  assert.equal(run.exitCode, 2);
});

test("Playwright 缺失时输出 not-run 并返回非零退出码", async () => {
  const run = await runScanner({ missingDependency: true });
  assert.equal(run.launches.length, 0);
  assert.equal(run.result.status, "not-run");
  assert.equal(run.exitCode, 2);
});

test("指定 Edge 时使用 msedge 通道，不能仍启动 Chrome", async () => {
  const run = await runScanner({ flags: ["--browser", "edge"] });
  assert.equal(run.exitCode, 0);
  assert.equal(run.engines[0], "chromium");
  assert.equal(run.launches[0].channel, "msedge");
  assert.equal(run.launches[0].headless, false);
  assert.equal(run.result.browser.name, "edge");
});

test("指定 Firefox 时选择 firefox 启动器，不使用 chromium", async () => {
  const run = await runScanner({ flags: ["--browser", "firefox"] });
  assert.equal(run.exitCode, 0);
  assert.deepEqual(run.engines, ["firefox"]);
  assert.equal(run.launches[0].channel, undefined);
  assert.equal(run.result.browser.engine, "firefox");
});

test("指定 WebKit 时如实记录 webkit，不冒充 Safari", async () => {
  const run = await runScanner({ flags: ["--browser", "webkit"] });
  assert.equal(run.exitCode, 0);
  assert.deepEqual(run.engines, ["webkit"]);
  assert.equal(run.result.browser.name, "webkit");
});

test("指定的浏览器启动失败，不自动降级为默认 Chrome", async () => {
  const run = await runScanner({ flags: ["--browser", "firefox"], launchError: "Firefox is unavailable" });
  assert.deepEqual(run.engines, ["firefox"]);
  assert.equal(run.exitCode, 2);
  assert.equal(run.result.status, "not-run");
  assert.equal(run.result.browser.name, "firefox");
});

test("不支持的浏览器返回 not-run，不把其他引擎冒充用户指定浏览器", async () => {
  const run = await runScanner({ flags: ["--browser", "safari"] });
  assert.equal(run.launches.length, 0);
  assert.equal(run.exitCode, 2);
  assert.equal(run.result.status, "not-run");
  assert.equal(run.result.browser.name, "safari");
});
