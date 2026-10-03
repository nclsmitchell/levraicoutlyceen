import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs/promises";
import assert from "node:assert/strict";
const base = process.env.APP_URL || "http://127.0.0.1:3000";
const reportPath = process.env.UI_REPORT || "docs/ui-validation.json";
const screenshotDir = process.env.SCREENSHOT_DIR || "docs/screenshots";
const theme = process.env.UI_THEME || "light";
assert(["light", "dark"].includes(theme), "UI_THEME must be light or dark");
await fs.mkdir(screenshotDir, { recursive: true });
const data = JSON.parse(await fs.readFile("data/derived/current.json", "utf8"));
const school =
  data.establishments.find(
    (e) => e.category === "principal" && e.uai === "0930125F",
  ) || data.establishments.find((e) => e.category === "principal");
const financial = data.financial.find((r) => r.uai === school.uai);
const samples = ["GT", "PRO", "LPO", "POST_BAC", "CMR"].map((type) => {
  const e = data.establishments.find(
    (e) =>
      e.category === "principal" &&
      (type === "GT"
        ? e.nature.includes("GENERAL")
        : type === "PRO"
          ? e.nature === "LYCEE PROFESSIONNEL"
          : type === "LPO"
            ? e.nature === "LYCEE POLYVALENT"
            : type === "POST_BAC"
              ? e.post_bac
              : data.financial.some(
                  (r) => r.uai === e.uai && r.scope.includes("CMR"),
                )),
  );
  return { type, uai: e?.uai, name: e?.name };
});
const routes = [
  ["accueil", "/"],
  ["annuaire", "/annuaire?dep=93"],
  ["fiche", "/lycees/" + school.uai],
  [
    "comparateur",
    "/comparer?level=departement&a=93&b=92&from=2023&to=2025&population=GT&panel=constant",
  ],
  ["sources", "/sources"],
  ["methode", "/methode"],
  ["couverture", "/couverture"],
  ["preuve", "/preuves/" + school.evidence],
  ["operation", "/operations/" + financial.id],
  [
    "travaux",
    "/travaux/" + data.legacy_operations.find((r) => r.uai === school.uai).id,
  ],
];
const browser = await chromium.launch({ headless: true });
const report = {
  generated: new Date().toISOString(),
  base,
  revision: data.revision,
  theme,
  samples,
  pages: [],
  errors: [],
};
try {
  for (const [device, viewport] of [
    ["ordinateur", { width: 1440, height: 1000 }],
    ["mobile", { width: 390, height: 844 }],
  ]) {
    const context = await browser.newContext({ viewport, colorScheme: theme });
    await context.addInitScript((value) => {
      localStorage.setItem("levraicoutlyceen-theme", value);
    }, theme);
    const page = await context.newPage();
    page.on("pageerror", (e) => report.errors.push(String(e)));
    for (const [name, path] of routes) {
      const response = await page.goto(base + path, {
        waitUntil: "networkidle",
      });
      assert.equal(response.status(), 200, path);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      );
      assert.equal(overflow, false, device + ": overflow " + path);
      const a11y = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      report.pages.push({
        device,
        path,
        status: response.status(),
        accessibility: a11y.violations.map((v) => ({
          id: v.id,
          impact: v.impact,
          nodes: v.nodes.map((n) => ({
            target: n.target,
            summary: n.failureSummary,
          })),
        })),
      });
      if (["accueil", "fiche", "comparateur", "annuaire"].includes(name))
        await page.screenshot({
          path: `${screenshotDir}/${name}-${device}.png`,
          fullPage: true,
        });
    }
    await context.close();
  }
  const page = await browser.newPage({ colorScheme: theme });
  await page.goto(base + "/");
  await page
    .getByLabel("Rechercher un lycée, une ville ou un UAI")
    .fill(school.uai);
  await page.getByRole("button", { name: "Rechercher", exact: true }).click();
  await page.waitForURL(/annuaire/);
  assert(
    await page
      .getByRole("heading", { name: school.name, exact: true })
      .isVisible(),
  );
  await page
    .getByRole("heading", { name: school.name, exact: true })
    .getByRole("link")
    .click();
  await page.waitForURL(/lycees/);
  await page.getByRole("link", { name: "Vérifier l’identité" }).click();
  await page.waitForURL(/preuves/);
  assert(
    await page
      .getByRole("heading", { name: "Revenir au document d’origine." })
      .isVisible(),
  );
  await page.goto(base + "/comparer?level=lycee&a=" + school.uai);
  await page
    .getByRole("combobox", { name: "Première rentrée", exact: true })
    .fill("2020");
  await page.getByRole("option", { name: "2020", exact: true }).click();
  await page
    .getByRole("combobox", { name: "Dernière rentrée", exact: true })
    .fill("2024");
  await page.getByRole("option", { name: "2024", exact: true }).click();
  await page.getByRole("button", { name: "Comparer", exact: true }).click();
  await page.waitForURL(/from=2020.*to=2024/);
  assert(
    await page
      .getByRole("heading", { name: "Effectifs scolaires publiés · GT" })
      .isVisible(),
  );
  for (const sample of samples) {
    assert(sample.uai, "Missing representative " + sample.type);
    const r = await page.goto(base + "/lycees/" + sample.uai);
    assert.equal(r.status(), 200);
    assert(
      await page
        .getByRole("heading", { name: sample.name, exact: true })
        .isVisible(),
    );
  }
  const exported = await (
    await fetch(base + "/api/export?uai=" + school.uai)
  ).json();
  assert(exported.rows.length > 0);
  assert(exported.rows.every((r) => r.source_sha256 && r.rule && r.source_url));
  const csv = await (
    await fetch(base + "/api/export?uai=" + school.uai + "&format=csv")
  ).text();
  assert(csv.includes("source_sha256"));
  const comparison = await (
    await fetch(
      base +
        "/api/export?level=departement&a=93&b=92&from=2023&to=2025&population=GT&panel=constant",
    )
  ).json();
  assert.equal(comparison.rows.length, 6);
  assert(
    comparison.rows.every(
      (r) =>
        r.cost_ratio === null &&
        r.provenance.length === r.inputs.length &&
        r.formula,
    ),
  );
  for (const report of [
    "coverage",
    "residual",
    "matches",
    "quarantine",
    "pdf-unmatched",
  ]) {
    const r = await fetch(base + "/api/export?report=" + report);
    assert.equal(r.status, 200);
    assert(Array.isArray((await r.json()).rows));
  }
  assert.equal(
    (await fetch(base + "/api/export?report=../private")).status,
    400,
  );
  assert.equal((await fetch(base + "/api/source/invalid")).status, 404);
  const raw = await fetch(base + "/api/source/" + data.sources[0].sha256);
  assert.equal(raw.status, 200);
  await page.goto(base + "/");
  await page.keyboard.press("Tab");
  assert(
    await page
      .getByRole("link", { name: "Aller au contenu" })
      .evaluate((el) => el === document.activeElement),
  );
  await page.keyboard.press("Enter");
  assert.equal(new URL(page.url()).hash, "#contenu");
  await page.close();
} finally {
  await browser.close();
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
}
const violations = report.pages.flatMap((p) =>
  p.accessibility.map((v) => ({ ...v, path: p.path, device: p.device })),
);
console.log(
  JSON.stringify(
    {
      pages: report.pages.length,
      samples,
      violations: violations.length,
      errors: report.errors,
    },
    null,
    2,
  ),
);
assert.equal(report.errors.length, 0, "Browser runtime errors");
assert.equal(
  violations.length,
  0,
  "Accessibility violations: see " + reportPath,
);
