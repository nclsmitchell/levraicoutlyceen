"use client";
import { useEffect, useId, useRef, useState } from "react";

export type ComparisonPoint = {
  year: number;
  value: number | null;
  covered: number;
  total: number;
  connect: boolean;
};
const number = (value: number) =>
  new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(value);
const colors = ["#245a48", "#826033"];

function Chart({
  kind,
  series,
  labels,
  selected,
  onSelect,
}: {
  kind: "enrollment" | "coverage";
  series: [ComparisonPoint[], ComparisonPoint[]];
  labels: [string, string];
  selected: number;
  onSelect: (year: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();
  const [width, setWidth] = useState(560);
  useEffect(() => {
    const observer = new ResizeObserver(([entry]) =>
      setWidth(Math.max(260, entry.contentRect.width)),
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  const years = series[0].map((p) => p.year);
  const height = 250,
    left = 54,
    right = 18,
    bottom = 38,
    top = 23;
  const rawMax = Math.max(
    2,
    ...series
      .flat()
      .map((p) => (kind === "enrollment" ? (p.value ?? 0) : p.total)),
  );
  const step =
    rawMax < 10 ? 2 : Math.pow(10, Math.floor(Math.log10(rawMax))) / 2;
  const max = Math.ceil(rawMax / step) * step;
  const plotWidth = width - left - right;
  const x = (i: number) => left + (plotWidth * (i + 0.5)) / years.length;
  const y = (v: number) =>
    height - bottom - (v / max) * (height - bottom - top);
  const barWidth = Math.min(26, plotWidth / years.length / 3.5);
  const missing = series.flat().every((p) => p.value === null);
  const title =
    kind === "enrollment" ? "Effectifs publiés" : "Disponibilité des effectifs";
  return (
    <article className="comparison-chart-card">
      <h3 id={`${id}-heading`}>{title}</h3>
      <p>
        {kind === "enrollment"
          ? "Élèves à la rentrée · même échelle pour les deux sélections"
          : "Établissements documentés sur l’ensemble sélectionné"}
      </p>
      <div ref={ref}>
        {kind === "enrollment" && missing ? (
          <div className="chart-empty">
            Aucun effectif publié pour cette population et cette période. Une
            valeur absente ne vaut pas zéro.
          </div>
        ) : (
          <svg
            viewBox={`0 0 ${width} ${height}`}
            role="img"
            aria-labelledby={`${id}-heading ${id}-description`}
            onPointerMove={(event) => {
              const rect = event.currentTarget.getBoundingClientRect();
              const px = ((event.clientX - rect.left) * width) / rect.width;
              const index = Math.min(
                years.length - 1,
                Math.max(
                  0,
                  Math.floor(((px - left) / plotWidth) * years.length),
                ),
              );
              onSelect(years[index]);
            }}
          >
            <desc id={`${id}-description`}>
              {kind === "enrollment"
                ? "Séries A et B. Les segments s’interrompent si une rentrée manque, si le panel change ou à la rupture des formations PRO en 2025."
                : "Barres pleines : établissements dont l’effectif est publié. Contours : nombre d’établissements sélectionnés."}{" "}
              Les valeurs et les sources sont disponibles dans le tableau
              suivant.
            </desc>
            {[0, 0.5, 1].map((fraction) => (
              <g key={fraction}>
                <line
                  x1={left}
                  y1={y(max * fraction)}
                  x2={width - right}
                  y2={y(max * fraction)}
                  stroke="#dce2d9"
                />
                <text
                  x={left - 8}
                  y={y(max * fraction) + 4}
                  textAnchor="end"
                  fontSize="11"
                  fill="#52615a"
                >
                  {number(max * fraction)}
                </text>
              </g>
            ))}
            <line
              x1={x(years.indexOf(selected))}
              x2={x(years.indexOf(selected))}
              y1={top}
              y2={height - bottom}
              stroke="#aeb8a5"
              strokeDasharray="3 4"
            />
            {years.map((year, i) => (
              <text
                key={year}
                x={x(i)}
                y={height - 13}
                textAnchor="middle"
                fontSize="11"
                fill="#52615a"
              >
                {String(year).slice(width < 390 && years.length > 4 ? 2 : 0)}
              </text>
            ))}
            {series.map((points, s) => (
              <g key={s}>
                {points.map((p, i) =>
                  kind === "enrollment" ? (
                    p.value !== null && (
                      <g key={p.year}>
                        {i > 0 && p.connect && points[i - 1].value !== null && (
                          <line
                            data-series={s}
                            data-from={points[i - 1].year}
                            data-to={p.year}
                            x1={x(i - 1)}
                            y1={y(points[i - 1].value!)}
                            x2={x(i)}
                            y2={y(p.value)}
                            stroke={colors[s]}
                            strokeWidth="2.5"
                            strokeDasharray={s === 1 ? "6 4" : undefined}
                          />
                        )}
                        {s === 0 ? (
                          <circle
                            data-year={p.year}
                            cx={x(i)}
                            cy={y(p.value)}
                            r={selected === p.year ? 5 : 3.5}
                            fill={colors[s]}
                          />
                        ) : (
                          <rect
                            data-year={p.year}
                            x={x(i) - 4}
                            y={y(p.value) - 4}
                            width="8"
                            height="8"
                            fill="#fffefb"
                            stroke={colors[s]}
                            strokeWidth="2"
                          />
                        )}
                      </g>
                    )
                  ) : (
                    <g key={p.year}>
                      <rect
                        x={x(i) + (s === 0 ? -barWidth - 2 : 2)}
                        y={y(p.total)}
                        width={barWidth}
                        height={height - bottom - y(p.total)}
                        fill="none"
                        stroke={colors[s]}
                        strokeWidth="1.5"
                        strokeDasharray={s === 1 ? "4 3" : undefined}
                      />
                      {p.covered > 0 && (
                        <rect
                          x={x(i) + (s === 0 ? -barWidth - 2 : 2)}
                          y={y(p.covered)}
                          width={barWidth}
                          height={height - bottom - y(p.covered)}
                          fill={colors[s]}
                          opacity={s === 0 ? 1 : 0.72}
                        />
                      )}
                    </g>
                  ),
                )}
              </g>
            ))}
          </svg>
        )}
      </div>
      <div className="chart-legend comparison-legend">
        {labels.map((label, i) => (
          <span key={i}>
            <span style={{ color: colors[i] }} aria-hidden="true">
              {i === 0 ? "● ━" : "□ ┄"}
            </span>
            <strong>{i === 0 ? "A" : "B"}</strong> · {label}
          </span>
        ))}
      </div>
      {kind === "coverage" && (
        <small>
          Barre pleine : renseigné · contour : ensemble sélectionné. Cette
          couverture concerne les établissements, pas le coût ni la part des
          élèves.
        </small>
      )}
    </article>
  );
}

export default function ComparisonCharts({
  series,
  labels,
  population,
  constant,
}: {
  series: [ComparisonPoint[], ComparisonPoint[]];
  labels: [string, string];
  population: string;
  constant: boolean;
}) {
  const [selected, setSelected] = useState(series[0].at(-1)!.year);
  const partial = series.flat().some((p) => p.covered < p.total);
  return (
    <section
      className="comparison-charts"
      aria-label="Graphiques de comparaison"
    >
      <div className="chart-context">
        <strong>
          {population === "GT"
            ? "Voie générale et technologique"
            : "Voie professionnelle"}{" "}
          ·{" "}
          {constant
            ? "mêmes établissements à chaque rentrée"
            : "établissements disponibles à chaque rentrée"}
        </strong>
        <p>
          {partial
            ? "Les effectifs représentent uniquement les établissements documentés, pas le total du territoire. Consultez la couverture avant de lire les écarts."
            : "Les effectifs couvrent toutes les unités de cette sélection, dans le champ de la population choisie."}{" "}
          Les traits s’interrompent lorsque les données manquent ou les
          établissements suivis changent.
          {population === "PRO" &&
            " Le changement de périmètre des formations en 2025 interrompt aussi la série."}
        </p>
      </div>
      <div className="comparison-chart-grid">
        <Chart
          kind="enrollment"
          series={series}
          labels={labels}
          selected={selected}
          onSelect={setSelected}
        />
        <Chart
          kind="coverage"
          series={series}
          labels={labels}
          selected={selected}
          onSelect={setSelected}
        />
      </div>
      <div
        className="chart-year-controls"
        role="group"
        aria-label="Choisir une rentrée sur les graphiques"
      >
        <span>Rentrée</span>
        {series[0].map((p) => (
          <button
            type="button"
            key={p.year}
            aria-pressed={selected === p.year}
            onClick={() => setSelected(p.year)}
          >
            {p.year}
          </button>
        ))}
      </div>
      <div className="chart-readout" aria-live="polite" aria-atomic="true">
        <strong>{selected}</strong>
        {series.map((points, i) => {
          const p = points.find((p) => p.year === selected)!;
          return (
            <span key={i}>
              <b>{i === 0 ? "A" : "B"}</b> ·{" "}
              {p.value === null ? "Non documenté" : `${number(p.value)} élèves`}{" "}
              <small>
                {p.covered}/{p.total} établissements documentés
              </small>
            </span>
          );
        })}
        <a className="proof" href={`#effectifs-${selected}`}>
          Voir les valeurs et les preuves →
        </a>
      </div>
    </section>
  );
}
