import Link from "next/link";

import { BrandMarkSvg } from "./BrandMarkSvg";

const sizeStyles = {
  xs: { mark: "h-5 w-5", text: "text-[10px]", gap: "gap-1.5" },
  sm: { mark: "h-7 w-7", text: "text-xs", gap: "gap-2" },
  md: { mark: "h-8 w-8", text: "text-sm", gap: "gap-2.5" },
  lg: { mark: "h-10 w-10", text: "text-base", gap: "gap-3" },
  xl: { mark: "h-12 w-12", text: "text-lg", gap: "gap-3" },
} as const;

export type BrandLogoSize = keyof typeof sizeStyles;
export type BrandLogoVariant = "full" | "mark";
export type BrandLogoTheme = "light" | "dark" | "muted";

type Props = {
  /** Logo + texte, ou pictogramme seul */
  variant?: BrandLogoVariant;
  size?: BrandLogoSize;
  /** light : fond clair · dark : sidebar sombre · muted : texte secondaire (footer) */
  theme?: BrandLogoTheme;
  /** Si défini, enveloppe le bloc dans un lien */
  href?: string;
  className?: string;
  /** Affiche « DOMICIAL » à côté du picto (sauf variant=mark) */
  showWordmark?: boolean;
};

export function BrandLogo({
  variant = "full",
  size = "md",
  theme = "light",
  href,
  className = "",
  showWordmark = true,
}: Props) {
  const s = sizeStyles[size];
  const markTheme: "light" | "dark" | "muted" = theme === "dark" ? "dark" : "light";
  const word =
    theme === "dark"
      ? "font-bold uppercase tracking-[0.12em] text-white"
      : theme === "muted"
        ? "font-bold uppercase tracking-[0.12em] text-[#5c6570]"
        : "font-bold uppercase tracking-[0.12em] text-[#0f1419]";

  const inner = (
    <span className={`inline-flex min-w-0 max-w-full items-center ${s.gap} ${className}`}>
      <span className={`inline-flex shrink-0 ${s.mark}`}>
        <BrandMarkSvg className="h-full w-full" theme={markTheme} />
      </span>
      {variant === "full" && showWordmark ? (
        <span className={`min-w-0 flex-1 truncate leading-none ${s.text} ${word}`}>DOMICIAL</span>
      ) : null}
    </span>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-[#2563EB]">
        {inner}
      </Link>
    );
  }

  return inner;
}
