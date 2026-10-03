import type { Enrollment } from "@/lib/data";
export default function EnrollmentChart({ rows }: { rows: Enrollment[] }) {
  const width = 740,
    height = 190,
    pad = 38,
    years = Array.from({ length: 7 }, (_, i) => 2019 + i);
  const max = Math.max(1, ...rows.map((r) => r.value ?? 0));
  const x = (year: number) => pad + ((year - 2019) * (width - 2 * pad)) / 6;
  const y = (value: number) =>
    height - pad - (value * (height - 2 * pad)) / max;
  return (
    <figure className="enrollment-chart">
      <figcaption>
        Évolution des effectifs publiés à la rentrée · séries séparées
      </figcaption>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Évolution des effectifs GT et PRO. Les valeurs et leurs sources sont disponibles dans le tableau suivant. Les segments sont interrompus en cas d’année manquante et à la rupture de périmètre PRO de 2025."
      >
        <line
          x1={pad}
          y1={height - pad}
          x2={width - pad}
          y2={height - pad}
          stroke="var(--line)"
        />
        <text x={pad} y={22} fontSize="11" fill="var(--chart-label)">
          {max} élèves
        </text>
        {years.map((year) => (
          <text
            key={year}
            x={x(year)}
            y={height - 12}
            textAnchor="middle"
            fontSize="11"
            fill="var(--chart-label)"
          >
            {year}
          </text>
        ))}
        {["GT", "PRO"].map((pop) => {
          const values = years.map(
            (year) =>
              rows.find(
                (r) =>
                  r.year === year &&
                  r.population === pop &&
                  r.status === "observed",
              )?.value ?? null,
          );
          return (
            <g
              key={pop}
              stroke={pop === "GT" ? "var(--chart-a)" : "var(--chart-b)"}
            >
              {values.map((v, i) =>
                v !== null ? (
                  <g key={i}>
                    {i > 0 &&
                      values[i - 1] !== null &&
                      !(pop === "PRO" && years[i] === 2025) && (
                        <line
                          data-population={pop}
                          data-from={years[i - 1]}
                          data-to={years[i]}
                          x1={x(years[i - 1])}
                          y1={y(values[i - 1]!)}
                          x2={x(years[i])}
                          y2={y(v)}
                          strokeWidth="2"
                          strokeDasharray={pop === "PRO" ? "5 4" : undefined}
                        />
                      )}
                    <circle
                      cx={x(years[i])}
                      cy={y(v)}
                      r={pop === "GT" ? 3 : 4}
                      fill={pop === "GT" ? "var(--chart-a)" : "var(--surface)"}
                    />
                  </g>
                ) : null,
              )}
            </g>
          );
        })}
      </svg>
      <div className="chart-legend">
        <span>● GT · trait continu</span>
        <span>○ PRO · trait pointillé</span>
        <span>Année absente : aucun segment</span>
        <span>PRO 2025 : périmètre des formations modifié</span>
      </div>
    </figure>
  );
}
