import { chromium, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs/promises";
import assert from "node:assert/strict";

const base = process.env.APP_URL || "http://127.0.0.1:3000";
const data = JSON.parse(await fs.readFile("data/derived/current.json", "utf8"));
const report = {
  generated: new Date().toISOString(),
  base,
  revision: data.revision,
  checks: [],
  violations: [],
};
const browser = await chromium.launch({ headless: true });
const format = (v) =>
  new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(v);
async function choose(page, label, query, option) {
  const input = page.getByRole("combobox", { name: label, exact: true });
  await input.fill(query);
  await page.getByRole("option", { name: option, exact: true }).click();
}
try {
  for (const [device, viewport] of [
    ["ordinateur", { width: 1440, height: 1000 }],
    ["mobile", { width: 390, height: 844 }],
  ]) {
    const context = await browser.newContext({
      viewport,
      permissions: ["clipboard-read", "clipboard-write"],
    });
    const page = await context.newPage();
    await page.goto(base + "/");
    await page
      .locator(".quick-compare")
      .getByRole("button", { name: "Comparer →", exact: true })
      .click();
    assert.equal(new URL(page.url()).pathname, "/");
    assert.equal(
      await page.locator('.quick-compare input[name="a"]').inputValue(),
      "",
    );
    await choose(page, "Niveau", "lycee", "Lycées");
    const school = data.establishments.find((e) => e.uai === "0930125F");
    const schoolLabel = `${school.name} · ${school.city} · ${school.uai}`;
    await choose(page, "Première entité", "0930125f", schoolLabel);
    const a = page.getByRole("combobox", {
      name: "Première entité",
      exact: true,
    });
    await a.click();
    await a.press("Enter");
    assert.equal(await a.inputValue(), schoolLabel);
    await a.fill("aucun lycée xyz 000");
    assert(
      await page
        .getByText("Aucune correspondance.", { exact: false })
        .isVisible(),
    );
    await a.press("Escape");
    assert.equal(await a.inputValue(), schoolLabel);
    const other = data.establishments.find((e) => e.uai === "0920144G");
    await choose(
      page,
      "Seconde entité",
      "AGORA",
      `${other.name} · ${other.city} · ${other.uai}`,
    );
    await page.getByRole("button", { name: "Comparer →", exact: true }).click();
    await page.waitForURL(/comparer.*level=lycee/);
    assert.equal(new URL(page.url()).searchParams.get("a"), school.uai);
    assert.equal(new URL(page.url()).searchParams.get("b"), other.uai);
    assert.equal(await page.locator(".comparison-chart-card").count(), 2);
    report.checks.push({
      device,
      check:
        "required selections; UAI/case search; Escape restores choice; quick comparison URL",
    });

    // Keyboard selection must commit a code, never the typed label.
    const firstYear = page.getByRole("combobox", {
      name: "Première rentrée",
      exact: true,
    });
    await firstYear.fill("2020");
    await firstYear.press("ArrowDown");
    assert(await firstYear.getAttribute("aria-activedescendant"));
    const openAxe = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    report.violations.push(
      ...openAxe.violations.map((v) => ({
        device,
        context: "open searchable list",
        id: v.id,
        impact: v.impact,
      })),
    );
    await firstYear.press("Enter");
    assert.equal(await page.locator('input[name="from"]').inputValue(), "2020");
    await choose(page, "Dernière rentrée", "2022", "2022");
    await choose(page, "Première rentrée", "2024", "2024");
    assert.equal(await page.locator('input[name="to"]').inputValue(), "2024");
    await page.getByRole("button", { name: "Comparer", exact: true }).click();
    await page.waitForURL(/from=2024.*to=2024/);
    assert.equal(
      await page
        .locator(".comparison-chart-card")
        .first()
        .locator("line[data-series]")
        .count(),
      0,
    );
    await page
      .getByRole("button", { name: "Copier le lien", exact: true })
      .click();
    await expect(page.locator(".share-comparison [role=status]")).toHaveText(
      "Lien copié",
    );
    const copied = await page.evaluate(() => navigator.clipboard.readText());
    assert.equal(new URL(copied).searchParams.get("from"), "2024");
    report.checks.push({
      device,
      check:
        "keyboard selection; chronological years; one-year graph; canonical share link",
    });

    await page.goto(base + "/annuaire?dep=93&commune=93031");
    await choose(page, "Département", "75", "75 · Paris");
    assert.equal(await page.locator('input[name="commune"]').inputValue(), "");
    await choose(page, "Commune", "paris", "Paris");
    await page.getByRole("button", { name: "Appliquer", exact: true }).click();
    await page.waitForURL(/annuaire.*dep=75/);
    assert.equal(new URL(page.url()).searchParams.get("commune"), "75056");
    await choose(page, "Département", "93", "93 · Seine-Saint-Denis");
    const accentCity = data.establishments.find(
      (e) =>
        e.category === "principal" &&
        e.department === "93" &&
        e.city === "Epinay-sur-Seine",
    );
    assert(accentCity, "Real accented city fixture");
    await choose(page, "Commune", "ÉPINAY-SUR-SEINE", accentCity.city);
    await page.getByRole("button", { name: "Appliquer", exact: true }).click();
    await page.waitForURL(/annuaire.*dep=93/);
    assert.equal(
      new URL(page.url()).searchParams.get("commune"),
      accentCity.commune,
    );
    report.checks.push({
      device,
      check:
        "dependent communes reset; official Paris commune code; accent-insensitive search",
    });

    await page.goto(
      base +
        "/comparer?level=departement&a=93&b=92&from=2019&to=2025&population=GT&panel=constant",
    );
    await expect(
      page
        .locator(".comparison-chart-card")
        .first()
        .locator("line[data-series]"),
    ).toHaveCount(12);
    await page.getByRole("button", { name: "2023", exact: true }).click();
    const readout = page.locator(".chart-readout");
    const exported = await (
      await fetch(
        base +
          "/api/export?level=departement&a=93&b=92&from=2019&to=2025&population=GT&panel=constant",
      )
    ).json();
    const yearRows = exported.rows.filter((r) => r.year === 2023);
    // Use the same published export that a visitor can download.
    assert.equal(yearRows.length, 2);
    for (const row of yearRows)
      assert((await readout.innerText()).includes(format(row.value)));
    await readout.getByRole("link").click();
    assert.equal(new URL(page.url()).hash, "#effectifs-2023");
    assert(await page.locator("#effectifs-2023").isVisible());
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
    );
    const chartAxe = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    report.violations.push(
      ...chartAxe.violations.map((v) => ({
        device,
        context: "comparison graphs",
        id: v.id,
        impact: v.impact,
      })),
    );
    report.checks.push({
      device,
      check:
        "graph values equal export; keyboard year control; source-table link; no viewport overflow",
    });
    await context.close();
  }

  const page = await browser.newPage();
  const principalIds = new Set(
    data.establishments
      .filter((e) => e.category === "principal")
      .map((e) => e.uai),
  );
  const gapSchool = data.establishments.find(
    (e) =>
      principalIds.has(e.uai) &&
      [2020, 2021, 2022, 2023, 2024].some(
        (year) =>
          !data.enrollments.some(
            (r) =>
              r.uai === e.uai &&
              r.year === year &&
              r.population === "PRO" &&
              r.status === "observed",
          ) &&
          data.enrollments.some(
            (r) =>
              r.uai === e.uai &&
              r.year < year &&
              r.population === "PRO" &&
              r.status === "observed",
          ) &&
          data.enrollments.some(
            (r) =>
              r.uai === e.uai &&
              r.year > year &&
              r.population === "PRO" &&
              r.status === "observed",
          ),
      ),
  );
  assert(gapSchool, "Real gap fixture");
  await page.goto(
    base +
      `/comparer?level=lycee&a=${gapSchool.uai}&b=0752608C&from=2019&to=2025&population=PRO`,
  );
  const segments = await page
    .locator(".comparison-chart-card")
    .first()
    .locator('line[data-series="0"]')
    .evaluateAll((nodes) =>
      nodes.map((n) => ({
        from: Number(n.dataset.from),
        to: Number(n.dataset.to),
      })),
    );
  const publishedYears = new Set(
    data.enrollments
      .filter(
        (r) =>
          r.uai === gapSchool.uai &&
          r.population === "PRO" &&
          r.status === "observed",
      )
      .map((r) => r.year),
  );
  assert.equal(
    await page
      .locator(".comparison-chart-card")
      .first()
      .locator("circle[data-year]")
      .count(),
    publishedYears.size,
    "Each observed year has a real plotted point",
  );
  const expectedSegments = [2020, 2021, 2022, 2023, 2024].filter(
    (year) => publishedYears.has(year) && publishedYears.has(year - 1),
  ).length;
  assert.equal(
    segments.length,
    expectedSegments,
    "Only consecutive observed years may be connected",
  );
  for (const segment of segments) {
    assert.equal(segment.to - segment.from, 1);
    for (const year of [segment.from, segment.to])
      assert(
        data.enrollments.some(
          (r) =>
            r.uai === gapSchool.uai &&
            r.year === year &&
            r.population === "PRO" &&
            r.status === "observed",
        ),
      );
  }
  await page.goto(
    base + "/comparer?level=lycee&a=0752608C&b=0752608C&from=2019&to=2025",
  );
  assert(
    await page
      .getByRole("heading", {
        name: "Effectifs scolaires publiés · PRO",
        exact: true,
      })
      .isVisible(),
  );
  assert.equal(
    await page
      .locator('line[data-series][data-from="2024"][data-to="2025"]')
      .count(),
    0,
  );
  await page.goto(
    base +
      "/comparer?level=lycee&a=0930125F&b=0920144G&from=2025&to=2025&population=PRO",
  );
  assert(
    await page
      .getByText(
        "Aucun effectif publié pour cette population et cette période.",
        { exact: false },
      )
      .isVisible(),
  );
  assert.equal(
    await page
      .locator(".comparison-chart-card")
      .first()
      .locator("circle,rect[data-year]")
      .count(),
    0,
  );
  report.checks.push({
    check:
      "real missing years never bridged; PRO 2025 method break; empty data never plotted as zero",
    gap_uai: gapSchool.uai,
  });
  await page.goto(base + "/lycees/0752608C");
  assert.equal(
    await page
      .locator('line[data-population="PRO"][data-from="2024"][data-to="2025"]')
      .count(),
    0,
  );
  report.checks.push({
    check: "school and comparison graphs both respect the PRO 2025 break",
  });
  await page.close();
  assert.equal(
    report.violations.length,
    0,
    "Accessibility violations: see UX report",
  );
} finally {
  await browser.close();
  await fs.writeFile(
    process.env.UX_REPORT || "docs/ux-validation.json",
    JSON.stringify(report, null, 2),
  );
}
console.log(
  JSON.stringify(
    { checks: report.checks.length, violations: report.violations.length },
    null,
    2,
  ),
);
