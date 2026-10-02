import fs from "node:fs/promises";
import { getData } from "@/lib/data";
export async function GET(
  _r: Request,
  { params }: { params: Promise<{ hash: string }> },
) {
  const { hash } = await params;
  const d = await getData();
  const s = d.sources.find((s) => s.sha256 === hash);
  if (!s) return new Response("Source inconnue", { status: 404 });
  const raw = await fs.readFile(s.path);
  return new Response(raw, {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="${s.id}-${hash.slice(0, 12)}.${s.mode === "pdf" ? "pdf" : raw[0] === 31 && raw[1] === 139 ? "json.gz" : "json"}"`,
      "X-Content-Type-Options": "nosniff",
    },
  });
}
