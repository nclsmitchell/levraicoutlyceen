import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
const root = process.cwd();
const output = path.join(root, ".cloud-data");
const snapshot = JSON.parse(
  await fs.readFile("data/derived/current.json", "utf8"),
);
await fs.rm(output, { recursive: true, force: true });
await fs.mkdir(output, { recursive: true });
const copy = async (file) => {
  const target = path.join(output, file.slice("data/".length));
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.copyFile(path.join(root, file), target);
};
const archives = new Map();
for (const source of snapshot.sources) {
  for (const item of [source, source.schema, source.count_check].filter(
    Boolean,
  )) {
    if (!/^data\/raw\/[a-f0-9]{64}\.(json|pdf)$/.test(item.path))
      throw new Error("Archive outside public, hash-named source allow-list");
    const bytes = await fs.readFile(item.path);
    if (crypto.createHash("sha256").update(bytes).digest("hex") !== item.sha256)
      throw new Error("Source integrity mismatch: " + item.path);
    archives.set(item.path, item.sha256);
  }
}
for (const file of archives.keys()) await copy(file);
for (const file of [
  "data/catalog.json",
  "data/derived/current.json",
  "data/pdf-reviewed.json",
])
  await copy(file);
for (const report of [
  "coverage",
  "residual",
  "matches",
  "quarantine",
  "pdf-unmatched",
  "pdf-controls",
  "summary",
])
  await copy("data/reports/" + report + ".json");
await fs.writeFile(
  path.join(output, "release.json"),
  JSON.stringify(
    {
      revision: snapshot.revision,
      sources: [...archives].map(([file, sha256]) => ({ file, sha256 })),
      visibility: "reviewed_public_data_only",
      created: new Date().toISOString(),
    },
    null,
    2,
  ),
);
console.log(
  `Public release ${snapshot.revision}: ${archives.size} verified archives; no private original or credentials.`,
);
