"use client";
import { useState } from "react";
import SearchSelect from "./search-select";

export default function CompareFilters({
  options,
  level,
  a,
  b,
  from,
  to,
  population,
  constant,
}: {
  options: [string, string][];
  level: string;
  a: string;
  b: string;
  from: number;
  to: number;
  population: string;
  constant: boolean;
}) {
  const [first, setFirst] = useState(a);
  const [second, setSecond] = useState(b);
  const [start, setStart] = useState(String(from));
  const [end, setEnd] = useState(String(to));
  const [pop, setPop] = useState(population);
  const [mode, setMode] = useState(constant ? "constant" : "available");
  const [pending, setPending] = useState(false);
  const dirty =
    first !== a ||
    second !== b ||
    Number(start) !== from ||
    Number(end) !== to ||
    pop !== population ||
    mode !== (constant ? "constant" : "available");
  const years = Array.from({ length: 7 }, (_, i) => ({
    value: String(2019 + i),
    label: String(2019 + i),
  }));
  const entities = options.map(([value, label]) => ({
    value,
    label: level === "departement" ? `${value} · ${label}` : label,
  }));
  return (
    <form
      className="filters compare-filters"
      action="/comparer"
      onSubmit={() => setPending(true)}
    >
      <input type="hidden" name="level" value={level} />
      <SearchSelect
        label="Première entité"
        name="a"
        className="wide"
        options={entities}
        value={first}
        onValueChange={setFirst}
        required
      />
      <SearchSelect
        label="Seconde entité"
        name="b"
        className="wide"
        options={entities}
        value={second}
        onValueChange={setSecond}
        required
      />
      <SearchSelect
        label="Première rentrée"
        name="from"
        options={years}
        value={start}
        onValueChange={(v) => {
          setStart(v);
          if (Number(v) > Number(end)) setEnd(v);
        }}
      />
      <SearchSelect
        label="Dernière rentrée"
        name="to"
        options={years.filter((y) => Number(y.value) >= Number(start))}
        value={end}
        onValueChange={setEnd}
      />
      <SearchSelect
        label="Population"
        name="population"
        options={[
          { value: "GT", label: "Générale et technologique" },
          { value: "PRO", label: "Professionnelle" },
        ]}
        value={pop}
        onValueChange={setPop}
      />
      <SearchSelect
        label="Établissements suivis"
        name="panel"
        options={[
          { value: "available", label: "Disponibles chaque année" },
          { value: "constant", label: "Les mêmes sur toute la période" },
        ]}
        value={mode}
        onValueChange={setMode}
      />
      <button className="button" disabled={pending}>
        {pending ? "Comparaison…" : "Comparer"}
      </button>
      <p className="filter-help">
        « Les mêmes sur toute la période » conserve uniquement les
        établissements dont l’effectif est publié à chaque rentrée. GT et PRO
        sont étudiés séparément.
      </p>
      {dirty && (
        <p className="filter-dirty" role="status">
          Sélection modifiée : cliquez sur « Comparer » pour actualiser les
          résultats.
        </p>
      )}
    </form>
  );
}
