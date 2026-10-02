"use client";
import Link from "next/link";
import { useState } from "react";
import SearchSelect from "./search-select";

export default function DirectoryFilters({
  departments,
  schools,
  initial,
}: {
  departments: [string, string][];
  schools: {
    department: string;
    commune: string;
    city: string;
    category: string;
  }[];
  initial: {
    dep: string;
    commune: string;
    type: string;
    voie: string;
    q: string;
  };
}) {
  const [dep, setDep] = useState(initial.dep);
  const [commune, setCommune] = useState(initial.commune);
  const [type, setType] = useState(initial.type);
  const cities = [
    ...new Map(
      schools
        .filter(
          (e) =>
            (!dep || dep === e.department) &&
            (type === "all" || e.category === type),
        )
        .map((e) => [e.commune, e.city]),
    ).entries(),
  ].sort((a, b) => a[1].localeCompare(b[1], "fr"));
  return (
    <form className="filters" action="/annuaire">
      <label className="wide">
        Nom, ville ou UAI
        <input
          name="q"
          defaultValue={initial.q}
          placeholder="Rechercher dans l’annuaire…"
        />
      </label>
      <SearchSelect
        label="Département"
        name="dep"
        options={[
          { value: "", label: "Tous les départements" },
          ...departments.map(([value, label]) => ({
            value,
            label: `${value} · ${label}`,
          })),
        ]}
        value={dep}
        onValueChange={(v) => {
          setDep(v);
          setCommune("");
        }}
      />
      <SearchSelect
        label="Commune"
        name="commune"
        options={[
          { value: "", label: "Toutes les communes" },
          ...cities.map(([value, label]) => ({ value, label })),
        ]}
        value={commune}
        onValueChange={setCommune}
        hint={
          dep
            ? "Communes du département choisi"
            : "Choisissez un département pour réduire la liste"
        }
      />
      <SearchSelect
        label="Catégorie"
        name="type"
        value={type}
        onValueChange={(v) => {
          setType(v);
          setCommune("");
        }}
        options={[
          { value: "principal", label: "Lycées du périmètre principal" },
          { value: "section", label: "Sections rattachées" },
          { value: "attached", label: "Unités rattachées" },
          { value: "erea", label: "Enseignement adapté (EREA)" },
          { value: "other", label: "Autres tutelles" },
          { value: "historical", label: "UAI historiques à qualifier" },
          { value: "all", label: "Toutes les unités administratives" },
        ]}
      />
      <SearchSelect
        label="Voie déclarée"
        name="voie"
        defaultValue={initial.voie}
        options={[
          { value: "", label: "Toutes les voies" },
          ...["Générale", "Technologique", "Professionnelle"].map((v) => ({
            value: v,
            label: v,
          })),
        ]}
      />
      <button className="button">Appliquer</button>
      <Link href="/annuaire" className="reset">
        Réinitialiser
      </Link>
    </form>
  );
}
