"use client";
import { useState } from "react";
import SearchSelect from "./search-select";
export default function QuickCompare({
  departments,
  schools,
}: {
  departments: [string, string][];
  schools: [string, string][];
}) {
  const [level, setLevel] = useState("departement");
  const options = level === "departement" ? departments : schools;
  return (
    <section className="quick-compare">
      <div>
        <div className="eyebrow">METTRE LES DONNÉES EN REGARD</div>
        <h2>Deux entités, un même périmètre.</h2>
      </div>
      <form action="/comparer">
        <input type="hidden" name="from" value="2019" />
        <input type="hidden" name="to" value="2025" />
        <input type="hidden" name="panel" value="constant" />
        <SearchSelect
          label="Niveau"
          name="level"
          value={level}
          onValueChange={setLevel}
          options={[
            { value: "departement", label: "Départements" },
            { value: "lycee", label: "Lycées" },
          ]}
        />
        <SearchSelect
          label="Première entité"
          name="a"
          required
          key={level + "a"}
          options={options.map(([value, label]) => ({
            value,
            label: level === "departement" ? `${value} · ${label}` : label,
          }))}
          placeholder="Rechercher et choisir…"
        />
        <SearchSelect
          label="Seconde entité"
          name="b"
          required
          key={level + "b"}
          options={options.map(([value, label]) => ({
            value,
            label: level === "departement" ? `${value} · ${label}` : label,
          }))}
          placeholder="Rechercher et choisir…"
        />
        <button className="button">Comparer →</button>
      </form>
    </section>
  );
}
