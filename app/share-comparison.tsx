"use client";
import { useState } from "react";
import { Copy, Check } from "lucide-react";
export default function ShareComparison({ query }: { query: string }) {
  const [status, setStatus] = useState("");
  const [fallback, setFallback] = useState("");
  return (
    <div className="share-comparison">
      <button
        type="button"
        className="button secondary"
        onClick={async () => {
          const url = `${window.location.origin}/comparer?${query}`;
          try {
            await navigator.clipboard.writeText(url);
            setStatus("Lien copié");
          } catch {
            setFallback(url);
            setStatus("Copiez le lien ci-dessous");
          }
        }}
      >
        {status === "Lien copié" ? <Check size={16} /> : <Copy size={16} />}
        Copier le lien
      </button>
      <span role="status">
        {status || "Les sélections et la période sont incluses dans le lien."}
      </span>
      {fallback && (
        <label>
          Lien à partager
          <input readOnly value={fallback} onFocus={(e) => e.target.select()} />
        </label>
      )}
    </div>
  );
}
