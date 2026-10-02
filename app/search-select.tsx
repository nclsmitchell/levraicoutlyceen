"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown, Check, Search } from "lucide-react";

export type SelectOption = { value: string; label: string; keywords?: string };
const normalize = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

export default function SearchSelect({
  label,
  name,
  options,
  defaultValue = "",
  value,
  onValueChange,
  placeholder = "Choisir…",
  required = false,
  className = "",
  hint,
}: {
  label: string;
  name: string;
  options: SelectOption[];
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  hint?: string;
}) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const [selected, setSelected] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(-1);
  const current = value ?? selected;
  const selectedOption = options.find((o) => o.value === current);
  const words = normalize(query).split(/\s+/).filter(Boolean);
  const filtered = options.filter((o) =>
    words.every((word) =>
      normalize(`${o.label} ${o.value} ${o.keywords || ""}`).includes(word),
    ),
  );
  const activeId =
    active >= 0 && filtered[active] ? `${id}-option-${active}` : undefined;

  useEffect(() => {
    if (open && active >= 0)
      list.current?.children[active]?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  const close = () => {
    setOpen(false);
    setQuery("");
    setActive(-1);
  };
  const choose = (option: SelectOption) => {
    setSelected(option.value);
    onValueChange?.(option.value);
    close();
  };

  return (
    <div className={`select-field ${className}`}>
      <label htmlFor={id}>{label}</label>
      <div className="search-select">
        <input
          type="hidden"
          name={name}
          value={selectedOption ? current : ""}
        />
        <input
          ref={input}
          id={id}
          type="text"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={`${id}-list`}
          aria-activedescendant={open ? activeId : undefined}
          aria-describedby={hint ? `${id}-hint` : undefined}
          autoComplete="off"
          spellCheck={false}
          required={required}
          placeholder={open ? "Rechercher dans la liste…" : placeholder}
          value={open ? query : selectedOption?.label || ""}
          onFocus={() => {
            setOpen(true);
            setActive(-1);
          }}
          onClick={() => setOpen(true)}
          onBlur={close}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(-1);
            setOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown" || e.key === "ArrowUp") {
              e.preventDefault();
              setOpen(true);
              setActive(
                e.key === "ArrowDown"
                  ? Math.min(active + 1, filtered.length - 1)
                  : active < 0
                    ? filtered.length - 1
                    : Math.max(0, active - 1),
              );
            } else if (e.key === "Enter" && open) {
              e.preventDefault();
              const option =
                filtered[active >= 0 ? active : query.trim() ? 0 : -1];
              if (option) choose(option);
              else if (!query.trim()) close();
            } else if (e.key === "Escape" && open) {
              e.preventDefault();
              close();
            }
          }}
        />
        <button
          type="button"
          tabIndex={-1}
          className="select-toggle"
          aria-label={`Afficher les options : ${label}`}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            if (open) close();
            else {
              input.current?.focus();
              setOpen(true);
            }
          }}
        >
          {open ? <Search size={17} /> : <ChevronDown size={17} />}
        </button>
        {open && (
          <div className="select-popup">
            <div className="select-count" role="status">
              {filtered.length} résultat{filtered.length > 1 ? "s" : ""}
            </div>
            <ul
              id={`${id}-list`}
              ref={list}
              role="listbox"
              aria-label={`Options : ${label}`}
            >
              {filtered.map((option, index) => (
                <li
                  key={option.value}
                  id={`${id}-option-${index}`}
                  role="option"
                  aria-selected={index === active}
                  className={index === active ? "option-active" : ""}
                  onMouseDown={(e) => e.preventDefault()}
                  onPointerMove={() => setActive(index)}
                  onClick={() => choose(option)}
                >
                  <span>{option.label}</span>
                  {current === option.value && (
                    <Check size={16} aria-label="Valeur actuelle" />
                  )}
                </li>
              ))}
            </ul>
            {!filtered.length && (
              <p className="select-empty">
                Aucune correspondance. Essayez un nom, un code ou une ville.
              </p>
            )}
            <div className="select-help">
              ↑ ↓ pour parcourir · Entrée pour choisir · Échap pour fermer
            </div>
          </div>
        )}
      </div>
      {hint && <small id={`${id}-hint`}>{hint}</small>}
    </div>
  );
}
