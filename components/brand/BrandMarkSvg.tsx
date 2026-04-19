/**
 * Pictogramme marque : maison + document (équivalent visuel au logo DOMICIAL fourni).
 * Couleur principale #1D4189 (bleu roi du logo) ; variante dark pour fond #0f172a.
 */
export function BrandMarkSvg({
  className = "",
  theme = "light",
}: {
  className?: string;
  theme?: "light" | "dark" | "muted";
}) {
  const dark = theme === "dark";
  const house = dark ? "#ffffff" : "#1D4189";
  const paper = dark ? "#0f172a" : "#ffffff";
  const fold = dark ? "#334155" : "#cbd5e1";
  const line = dark ? "#94a3b8" : "#64748b";

  return (
    <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path
        d="M6 32V15.5L12 9h16l6 6.5V32H6Z"
        fill={house}
      />
      <rect x="11" y="16" width="18" height="15" rx="2" fill={paper} />
      <path d="M25 16v3.5h3.2L25 16Z" fill={fold} />
      <rect x="14" y="20" width="12" height="1.4" rx="0.35" fill={line} />
      <rect x="14" y="23" width="8" height="1.4" rx="0.35" fill={line} />
      <rect x="14" y="26" width="10" height="1.4" rx="0.35" fill={line} />
    </svg>
  );
}
