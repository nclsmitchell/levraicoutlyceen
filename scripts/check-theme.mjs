import { chromium, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs/promises";
import assert from "node:assert/strict";

const base = process.env.APP_URL || "http://127.0.0.1:3000";
const storageKey = "levraicoutlyceen-theme";
const screenshots = process.env.SCREENSHOT_DIR || "docs/screenshots-theme";
await fs.mkdir(screenshots, { recursive: true });
const report = {
  generated: new Date().toISOString(),
  base,
  checks: [],
  errors: [],
  violations: [],
};
const browser = await chromium.launch({ headless: true });
const colors = { light: "rgb(250, 251, 247)", dark: "rgb(17, 27, 22)" };
async function background(page, theme) {
  await expect
    .poll(() =>
      page
        .locator("body")
        .evaluate((el) => getComputedStyle(el).backgroundColor),
    )
    .toBe(colors[theme]);
}
function observe(page) {
  page.on("pageerror", (error) => report.errors.push(String(error)));
  page.on("console", (message) => {
    if (message.type() === "error") report.errors.push(message.text());
  });
}
async function accessibility(page, context) {
  const scan = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  report.violations.push(
    ...scan.violations.map((v) => ({
      context,
      id: v.id,
      nodes: v.nodes.map((n) => ({
        target: n.target,
        summary: n.failureSummary,
      })),
    })),
  );
}
try {
  for (const [device, viewport] of [
    ["ordinateur", { width: 1440, height: 1000 }],
    ["mobile", { width: 390, height: 844 }],
  ]) {
    const context = await browser.newContext({ viewport, colorScheme: "dark" });
    const page = await context.newPage();
    observe(page);
    await page.goto(base, { waitUntil: "networkidle" });
    await background(page, "dark");
    await expect(
      page.getByRole("button", { name: "Thème système", exact: true }),
    ).toHaveAttribute("aria-pressed", "true");
    await page
      .getByRole("button", { name: "Thème clair", exact: true })
      .focus();
    await page.keyboard.press("Enter");
    await background(page, "light");
    await page.emulateMedia({ colorScheme: "light" });
    await page
      .getByRole("button", { name: "Thème sombre", exact: true })
      .click();
    await background(page, "dark");
    await page.reload({ waitUntil: "networkidle" });
    await background(page, "dark");
    await expect(
      page.getByRole("button", { name: "Thème sombre", exact: true }),
    ).toHaveAttribute("aria-pressed", "true");
    await page
      .getByRole("navigation")
      .getByRole("link", { name: "Comparer", exact: true })
      .click();
    await page.waitForURL(/comparer/);
    await background(page, "dark");
    await accessibility(page, device + " dark charts");
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
    );
    // Series and labels must resolve to the dark palette, not their former fixed colors.
    const chartColors = await page
      .locator(".comparison-chart-card")
      .first()
      .evaluate((el) => ({
        text: getComputedStyle(el.querySelector("svg text")).fill,
        point: getComputedStyle(el.querySelector("svg circle")).fill,
      }));
    assert.equal(chartColors.text, "rgb(181, 196, 184)");
    assert.equal(chartColors.point, "rgb(160, 211, 178)");
    await page
      .locator(".comparison-charts")
      .screenshot({ path: `${screenshots}/graphiques-sombres-${device}.png` });
    await page.screenshot({
      path: `${screenshots}/comparateur-sombre-${device}.png`,
      fullPage: true,
    });
    const selector = page.getByRole("combobox", {
      name: "Première entité",
      exact: true,
    });
    await selector.click();
    await page.keyboard.press("ArrowDown");
    await accessibility(page, device + " dark open selector");
    await page.screenshot({
      path: `${screenshots}/selecteur-sombre-${device}.png`,
    });
    await page.keyboard.press("Escape");
    await page
      .getByRole("button", { name: "Thème système", exact: true })
      .click();
    await background(page, "light");
    await page.emulateMedia({ colorScheme: "dark" });
    await background(page, "dark");
    const second = await context.newPage();
    observe(second);
    await second.goto(base, { waitUntil: "networkidle" });
    await page
      .getByRole("button", { name: "Thème clair", exact: true })
      .click();
    await background(second, "light");
    await expect(
      second.getByRole("button", { name: "Thème clair", exact: true }),
    ).toHaveAttribute("aria-pressed", "true");
    await second
      .getByRole("button", { name: "Thème sombre", exact: true })
      .click();
    await background(page, "dark");
    await second.screenshot({
      path: `${screenshots}/accueil-sombre-${device}.png`,
      fullPage: true,
    });
    for (const button of await second.locator(".theme-switcher button").all()) {
      const box = await button.boundingBox();
      assert(box.width >= 44 && box.height >= 44, "Theme touch targets");
    }
    report.checks.push({
      device,
      check:
        "system default; keyboard choice; explicit override; persisted reload and navigation; OS changes; tab synchronization; charts and open selector accessibility",
    });
    await context.close();
  }

  const denied = await browser.newContext({ colorScheme: "dark" });
  await denied.addInitScript(() => {
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new DOMException("Storage disabled", "SecurityError");
      },
    });
  });
  const deniedPage = await denied.newPage();
  observe(deniedPage);
  await deniedPage.goto(base, { waitUntil: "networkidle" });
  await background(deniedPage, "dark");
  await deniedPage
    .getByRole("button", { name: "Thème clair", exact: true })
    .click();
  await background(deniedPage, "light");
  await denied.close();
  report.checks.push({
    check:
      "blocked storage preserves system fallback and functioning theme controls",
  });

  const invalid = await browser.newContext({ colorScheme: "dark" });
  await invalid.addInitScript(
    (key) => localStorage.setItem(key, "invalid"),
    storageKey,
  );
  const invalidPage = await invalid.newPage();
  observe(invalidPage);
  await invalidPage.goto(base, { waitUntil: "networkidle" });
  await background(invalidPage, "dark");
  await expect(invalidPage.locator("html")).toHaveAttribute(
    "data-theme",
    "system",
  );
  await invalid.close();
  report.checks.push({
    check: "invalid saved preference falls back to the system theme",
  });

  // Block hydration bundles to check the saved preference before React starts.
  const prePaint = await browser.newContext({ colorScheme: "light" });
  await prePaint.addInitScript(
    (key) => localStorage.setItem(key, "dark"),
    storageKey,
  );
  await prePaint.route("**/_next/static/chunks/**", (route) => route.abort());
  const prePaintPage = await prePaint.newPage();
  await prePaintPage.goto(base, { waitUntil: "load" });
  await background(prePaintPage, "dark");
  await prePaint.close();
  report.checks.push({
    check:
      "saved dark preference applies without waiting for hydration bundles",
  });

  const noJs = await browser.newContext({
    javaScriptEnabled: false,
    colorScheme: "dark",
  });
  const noJsPage = await noJs.newPage();
  await noJsPage.goto(base, { waitUntil: "load" });
  await background(noJsPage, "dark");
  await noJs.close();
  report.checks.push({
    check: "system dark theme remains available without JavaScript",
  });
  assert.equal(
    report.errors.length,
    0,
    "Browser or hydration errors: see theme report",
  );
  assert.equal(
    report.violations.length,
    0,
    "Accessibility violations: see theme report",
  );
} finally {
  await browser.close();
  await fs.writeFile(
    process.env.THEME_REPORT || "docs/theme-validation.json",
    JSON.stringify(report, null, 2),
  );
}
console.log(
  JSON.stringify(
    {
      checks: report.checks.length,
      errors: report.errors.length,
      violations: report.violations.length,
    },
    null,
    2,
  ),
);
