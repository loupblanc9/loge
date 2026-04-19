"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from "framer-motion";

const easeBrand = [0.16, 1, 0.3, 1] as const;

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.06 },
  },
};

const item = {
  hidden: { opacity: 0, y: 22 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: easeBrand },
  },
};

function RevealSection({
  children,
  className = "",
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <motion.section
      id={id}
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, ease: easeBrand }}
    >
      {children}
    </motion.section>
  );
}

export function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const onboardingRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: onboardingRef,
    offset: ["start end", "end start"],
  });
  const fillWidth = useTransform(scrollYProgress, [0, 1], ["5%", "100%"]);
  const [activeStep, setActiveStep] = useState(1);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (v < 0.28) setActiveStep(1);
    else if (v < 0.62) setActiveStep(2);
    else setActiveStep(3);
  });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const year = new Date().getFullYear();

  return (
    <div className="relative min-h-screen bg-[#fafbfc] text-[#0f1419]">
      <div
        className="pointer-events-none fixed inset-0 z-[1] opacity-[0.035]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
        aria-hidden
      />

      <header
        className={`sticky top-0 z-50 border-b transition-[background,box-shadow,border-color] duration-300 ${
          scrolled
            ? "border-[#0f1419]/8 bg-[#fafbfc]/92 shadow-[0_12px_40px_rgba(5,8,13,0.06)] backdrop-blur-md"
            : "border-[#0f1419]/6 bg-[#fafbfc]/78 backdrop-blur-md"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-[1120px] items-center justify-between gap-6 px-6">
          <Link href="/" className="flex items-center gap-2.5 font-bold tracking-[0.12em] text-[#0f1419]">
            <span
              className="h-7 w-7 rounded-lg shadow-sm"
              style={{
                background: "linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)",
              }}
              aria-hidden
            />
            <span className="text-[15px]">DOMICIAL</span>
          </Link>

          <nav
            className={`absolute left-0 right-0 top-16 flex flex-col gap-0 border-b border-[#0f1419]/6 bg-[#fafbfc]/98 px-6 py-4 backdrop-blur-md md:static md:flex md:flex-row md:items-center md:gap-7 md:border-0 md:bg-transparent md:p-0 ${
              menuOpen ? "flex" : "hidden md:flex"
            }`}
            aria-label="Navigation principale"
          >
            {[
              ["Valeur", "#valeur"],
              ["Types de dossiers", "#types"],
              ["Comment ça marche", "#etapes"],
              ["Confiance", "#confiance"],
            ].map(([label, href]) => (
              <a
                key={href}
                href={href}
                className="border-b border-gray-100 py-3 text-sm font-medium text-[#5c6570] transition hover:text-[#0f1419] md:border-0 md:py-0"
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="hidden rounded-xl px-4 py-2.5 text-sm font-semibold text-[#5c6570] transition hover:text-[#0f1419] md:inline-flex"
            >
              Connexion
            </Link>
            <Link
              href="/login"
              className="hidden rounded-xl bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-[#1d4ed8] hover:shadow-lg active:translate-y-0 md:inline-flex"
            >
              Créer mon dossier
            </Link>
            <button
              type="button"
              className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-lg md:hidden"
              aria-expanded={menuOpen}
              aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
              onClick={() => setMenuOpen((o) => !o)}
            >
              <span
                className={`block h-0.5 w-5 rounded bg-[#0f1419] transition ${menuOpen ? "translate-y-1 rotate-45" : ""}`}
              />
              <span
                className={`block h-0.5 w-5 rounded bg-[#0f1419] transition ${menuOpen ? "-translate-y-1 -rotate-45" : ""}`}
              />
            </button>
          </div>
        </div>
        {menuOpen ? (
          <div className="flex flex-col gap-2 border-t border-[#0f1419]/6 bg-[#fafbfc] px-6 py-4 md:hidden">
            <Link
              href="/login"
              className="rounded-xl py-2 text-center text-sm font-semibold text-[#5c6570]"
              onClick={() => setMenuOpen(false)}
            >
              Connexion
            </Link>
            <Link
              href="/login"
              className="rounded-xl bg-[#2563EB] py-3 text-center text-sm font-semibold text-white shadow-md"
              onClick={() => setMenuOpen(false)}
            >
              Créer mon dossier
            </Link>
          </div>
        ) : null}
      </header>

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden pb-20 pt-10 md:pb-24 md:pt-12" aria-labelledby="hero-title">
          <div className="pointer-events-none absolute inset-0">
            <div
              className="absolute -right-28 -top-44 h-[520px] w-[520px] rounded-full opacity-55 blur-[100px]"
              style={{ background: "radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)" }}
            />
            <div
              className="absolute -bottom-24 -left-20 h-[400px] w-[400px] rounded-full opacity-50 blur-[100px]"
              style={{ background: "radial-gradient(circle, rgba(30,58,138,0.22) 0%, transparent 70%)" }}
            />
            <div
              className="absolute inset-0 [mask-image:linear-gradient(to_bottom,black_40%,transparent)]"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(15,20,25,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(15,20,25,0.04)_1px,transparent_1px)",
                backgroundSize: "64px 64px",
              }}
            />
          </div>

          <div className="relative mx-auto grid max-w-[1120px] items-center gap-10 px-6 md:grid-cols-[1fr_1.05fr] md:gap-14">
            <motion.div variants={container} initial="hidden" animate="show">
              <motion.p variants={item} className="mb-4 text-[13px] font-semibold uppercase tracking-[0.08em] text-[#2563EB]">
                Plateforme dossier logement
              </motion.p>
              <motion.h1
                variants={item}
                id="hero-title"
                className="text-balance text-3xl font-bold leading-[1.12] tracking-tight text-[#05080d] md:text-[2.75rem]"
              >
                Créez votre dossier logement
                <br />
                <span className="bg-gradient-to-br from-[#0f172a] to-[#2563EB] bg-clip-text text-transparent">
                  en une minute
                </span>
              </motion.h1>
              <motion.p variants={item} className="mt-5 max-w-xl text-lg leading-relaxed text-[#5c6570]">
                Centralisez vos documents, choisissez votre type de dossier et suivez votre demande depuis une plateforme
                simple, rapide et sécurisée.
              </motion.p>
              <motion.div variants={item} className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-xl bg-[#2563EB] px-6 py-3.5 text-[15px] font-semibold text-white shadow-[0_8px_24px_rgba(37,99,235,0.35)] transition hover:-translate-y-0.5 hover:bg-[#1d4ed8] hover:shadow-[0_16px_40px_rgba(37,99,235,0.4)] active:translate-y-0"
                >
                  Créer mon dossier
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center rounded-xl border border-[#0f1419]/12 bg-white px-6 py-3.5 text-[15px] font-semibold text-[#0f1419] shadow-sm transition hover:-translate-y-0.5 hover:border-[#0f1419]/20 hover:shadow-md active:translate-y-0"
                >
                  Commencer maintenant
                </Link>
              </motion.div>
              <motion.ul variants={item} className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-[#374151]" role="list">
                {["Sans engagement", "Données protégées", "Suivi en temps réel"].map((t) => (
                  <li key={t} className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 text-xs font-bold text-[#16a34a]">
                      ✓
                    </span>
                    {t}
                  </li>
                ))}
              </motion.ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 28, rotateX: 4 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ duration: 0.65, delay: 0.15, ease: easeBrand }}
              className="perspective-[1200px]"
            >
              <div
                className="rounded-2xl border border-[#0f1419]/8 bg-white shadow-[0_24px_64px_rgba(5,8,13,0.12)]"
                style={{ animation: "domicial-mockup-float 7s ease-in-out infinite" }}
              >
                <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-3">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-400/90" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400/90" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/90" />
                  <span className="ml-2 flex-1 rounded-md bg-gray-100 px-3 py-1 text-center text-[11px] text-[#5c6570]">
                    app.domicial.fr / dossier
                  </span>
                </div>
                <div className="grid min-h-[280px] grid-cols-[minmax(0,120px)_1fr] md:min-h-[320px]">
                  <aside className="border-r border-gray-100 bg-[#f8fafc] p-3 text-[11px] font-bold tracking-wide text-[#2563EB]">
                    DOMICIAL
                    <div className="mt-4 space-y-1 font-semibold">
                      <div className="rounded-lg bg-white px-2 py-2 text-[#111827] shadow-sm">Mon dossier</div>
                      <div className="px-2 py-2 text-[#64748b]">Documents</div>
                      <div className="px-2 py-2 text-[#64748b]">Suivi</div>
                    </div>
                  </aside>
                  <div className="p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <span className="rounded-full bg-blue-50 px-2.5 py-1 font-semibold text-[#2563EB]">Dossier actif</span>
                      <span className="text-[#5c6570]">Avancement</span>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100">
                      <motion.div
                        className="h-full rounded-full bg-[#2563EB]"
                        initial={{ width: "0%" }}
                        animate={{ width: "62%" }}
                        transition={{ duration: 1.2, delay: 0.4, ease: easeBrand }}
                      />
                    </div>
                    <div className="mt-5 space-y-2">
                      {(
                        [
                          ["Identité", "Complet", true],
                          ["Revenus", "À compléter", false],
                          ["Justificatifs", "3 fichiers", true],
                        ] as const
                      ).map(([title, status, ok], i) => (
                        <motion.div
                          key={title}
                          initial={{ opacity: 0, x: 12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.55 + i * 0.1 }}
                          className="flex items-center justify-between rounded-xl border border-gray-100 bg-[#fafbfc] px-3 py-2.5 text-sm"
                        >
                          <span className="font-medium text-[#111827]">{title}</span>
                          <span
                            className={`text-xs font-semibold ${ok ? "text-[#16a34a]" : "text-[#64748b]"}`}
                          >
                            {status}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Valeur */}
        <RevealSection className="border-t border-[#0f1419]/5 bg-[#f0f4f8]/60 py-20" id="valeur">
          <div className="mx-auto max-w-[1120px] px-6">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-balance text-2xl font-bold tracking-tight text-[#05080d] md:text-3xl">
                Domicial simplifie tout votre dossier logement
              </h2>
              <p className="mt-4 text-lg text-[#5c6570]">
                Moins de friction, plus de clarté : une seule interface pour préparer, structurer et suivre votre demande —
                du premier document à la validation.
              </p>
            </div>
            <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  t: "Création rapide",
                  d: "Parcours guidé pour constituer un dossier complet sans perdre de temps.",
                  icon: "⚡",
                },
                {
                  t: "Documents centralisés",
                  d: "Tout au même endroit, avec une structure claire et des rappels utiles.",
                  icon: "☰",
                },
                {
                  t: "Suivi simplifié",
                  d: "Visualisez l’avancement et les prochaines étapes en un coup d’œil.",
                  icon: "◷",
                },
                {
                  t: "Interface claire",
                  d: "Une expérience sobre et lisible, pensée pour réduire la charge mentale.",
                  icon: "▣",
                },
              ].map((c, i) => (
                <motion.article
                  key={c.t}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06, duration: 0.45 }}
                  className="rounded-2xl border border-[#0f1419]/6 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-lg text-[#2563EB]">
                    {c.icon}
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-[#05080d]">{c.t}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#5c6570]">{c.d}</p>
                </motion.article>
              ))}
            </div>
          </div>
        </RevealSection>

        {/* Types */}
        <RevealSection className="py-20" id="types">
          <div className="mx-auto max-w-[1120px] px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-balance text-2xl font-bold tracking-tight text-[#05080d] md:text-3xl">
                Deux types de dossiers, une même exigence de qualité
              </h2>
              <p className="mt-4 text-lg text-[#5c6570]">Choisissez le parcours adapté à votre situation — social ou locatif privé.</p>
            </div>
            <div className="mt-12 grid gap-6 md:grid-cols-2">
              <article className="rounded-2xl border border-[#0f1419]/8 bg-white p-8 shadow-sm">
                <span className="text-xs font-semibold uppercase tracking-wide text-[#2563EB]">Parcours</span>
                <h3 className="mt-2 text-xl font-bold text-[#05080d]">Logement social</h3>
                <ul className="mt-6 space-y-3 text-sm text-[#374151]">
                  {[
                    "Dossier structuré selon les attentes des bailleurs",
                    "Liste des documents obligatoires maîtrisée",
                    "Suivi clair de chaque étape de complétion",
                  ].map((x) => (
                    <li key={x} className="flex gap-3">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-[10px] text-[#16a34a]">
                        ✓
                      </span>
                      {x}
                    </li>
                  ))}
                </ul>
              </article>
              <article className="rounded-2xl border border-[#2563EB]/25 bg-gradient-to-br from-[#eff6ff] to-white p-8 shadow-[0_16px_48px_rgba(37,99,235,0.12)]">
                <span className="text-xs font-semibold uppercase tracking-wide text-[#2563EB]">Parcours</span>
                <h3 className="mt-2 text-xl font-bold text-[#05080d]">Logement privé</h3>
                <ul className="mt-6 space-y-3 text-sm text-[#374151]">
                  {[
                    "Dossier locatif complet, prêt à transmettre",
                    "Prise en charge des pièces du garant",
                    "Préparation rapide pour maximiser vos chances",
                  ].map((x) => (
                    <li key={x} className="flex gap-3">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#2563EB]/15 text-[10px] text-[#2563EB]">
                        ✓
                      </span>
                      {x}
                    </li>
                  ))}
                </ul>
              </article>
            </div>
          </div>
        </RevealSection>

        {/* Étapes */}
        <section
          ref={onboardingRef}
          className="border-t border-white/5 bg-gradient-to-b from-[#0f172a] to-[#111d33] py-20 text-white"
          id="etapes"
          aria-labelledby="etapes-title"
        >
          <div className="mx-auto max-w-[1120px] px-6">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.55, ease: easeBrand }}
            >
              <h2 id="etapes-title" className="text-center text-2xl font-bold tracking-tight md:text-3xl">
                Comment ça marche
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-white/70">
                Un processus évident, en trois étapes — pour avancer sans hésiter.
              </p>
            </motion.div>

            <div className="mx-auto mt-12 max-w-2xl">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    className="h-full origin-left rounded-full bg-[#60a5fa]"
                    style={{ width: fillWidth }}
                  />
                </div>
                <ol className="mt-6 flex justify-between gap-2 text-center text-[11px] font-medium text-white/55 sm:text-xs">
                  {[
                    ["1", "Compte"],
                    ["2", "Type de dossier"],
                    ["3", "Documents & suivi"],
                  ].map(([n, label], idx) => (
                    <li key={n} className="flex flex-1 flex-col items-center gap-2">
                      <span
                        className={`flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-bold transition ${
                          activeStep >= idx + 1
                            ? "border-[#60a5fa] bg-[#2563EB] text-white"
                            : "border-white/20 bg-transparent text-white/50"
                        }`}
                      >
                        {n}
                      </span>
                      <span className={activeStep >= idx + 1 ? "text-white" : ""}>{label}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            <ol className="mx-auto mt-14 max-w-2xl space-y-8">
              {[
                ["1", "Créer son compte", "Accédez à votre espace sécurisé en quelques secondes."],
                ["2", "Choisir son type de dossier", "Social ou privé : le parcours s’adapte à votre projet."],
                ["3", "Téléverser les documents et suivre l’avancement", "Ajoutez vos pièces, visualisez la progression en direct."],
              ].map(([num, title, text], i) => (
                <motion.li
                  key={num}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="flex gap-5"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#2563EB] text-lg font-bold shadow-lg shadow-[#2563EB]/30">
                    {num}
                  </span>
                  <div>
                    <h3 className="text-lg font-bold">{title}</h3>
                    <p className="mt-1 text-white/70">{text}</p>
                  </div>
                </motion.li>
              ))}
            </ol>
          </div>
        </section>

        {/* Confiance */}
        <RevealSection className="py-20" id="confiance">
          <div className="mx-auto max-w-[1120px] px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-2xl font-bold tracking-tight text-[#05080d] md:text-3xl">La sérénité au cœur de l’expérience</h2>
              <p className="mt-4 text-lg text-[#5c6570]">
                Des engagements simples pour lever les freins et renforcer la confiance.
              </p>
            </div>
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ["Sécurisé", "Chiffrement et bonnes pratiques pour protéger vos données."],
                ["Rapide", "Un flux pensé pour gagner du temps à chaque étape."],
                ["Centralisé", "Un seul endroit pour vos documents et votre suivi."],
                ["Clair", "Des statuts explicites et une vision nette de l’avancement."],
              ].map(([w, h], i) => (
                <motion.div
                  key={w}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-2xl border border-[#0f1419]/6 bg-white p-8 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <span className="block text-xl font-bold tracking-tight text-[#05080d]">{w}</span>
                  <p className="mt-2 text-sm text-[#5c6570]">{h}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </RevealSection>

        {/* CTA */}
        <section className="relative overflow-hidden border-t border-[#0f1419]/6 bg-gradient-to-b from-[#f0f4f8] to-[#fafbfc] py-24" id="cta-final">
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 h-[400px] w-[600px] -translate-x-1/2 -translate-y-1/2"
            style={{
              background: "radial-gradient(circle, rgba(37,99,235,0.2) 0%, transparent 65%)",
              animation: "domicial-cta-glow 8s ease-in-out infinite",
            }}
          />
          <div className="relative mx-auto max-w-lg px-6 text-center">
            <h2 className="text-balance text-2xl font-bold tracking-tight text-[#05080d] md:text-3xl">
              Préparez votre dossier logement dès maintenant
            </h2>
            <p className="mt-4 text-lg text-[#5c6570]">
              Rejoignez une plateforme moderne et sérieuse — et avancez avec méthode.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/login"
                className="inline-flex min-w-[200px] items-center justify-center rounded-xl bg-[#2563EB] px-8 py-4 text-base font-semibold text-white shadow-[0_12px_32px_rgba(37,99,235,0.35)] transition hover:-translate-y-0.5 hover:bg-[#1d4ed8] active:translate-y-0"
              >
                Créer mon dossier
              </Link>
              <Link
                href="/register"
                className="inline-flex min-w-[200px] items-center justify-center rounded-xl border border-[#0f1419]/12 bg-white px-8 py-4 text-base font-semibold text-[#0f1419] shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                Commencer maintenant
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Mobile dock */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 flex border-t border-[#0f1419]/8 bg-[#fafbfc]/95 px-2 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur-md md:hidden"
        aria-label="Navigation rapide mobile"
      >
        {(
          [
            { href: "#valeur", label: "Valeur", icon: "⌂", cta: false },
            { href: "#types", label: "Dossiers", icon: "≡", cta: false },
            { href: "/login", label: "Créer", icon: "+", cta: true },
            { href: "#etapes", label: "Parcours", icon: "◷", cta: false },
          ] as const
        ).map((item) =>
          item.cta ? (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-1 flex-col items-center gap-1 rounded-xl bg-[#2563EB] py-2 text-[11px] font-semibold text-white shadow-md"
            >
              <span className="text-lg leading-none">{item.icon}</span>
              {item.label}
            </Link>
          ) : (
            <a key={item.href} href={item.href} className="flex flex-1 flex-col items-center gap-1 py-2 text-[11px] font-medium text-[#5c6570]">
              <span className="text-lg leading-none opacity-80">{item.icon}</span>
              {item.label}
            </a>
          ),
        )}
      </nav>

      <footer className="border-t border-[#0f1419]/6 bg-[#fafbfc] pb-24 pt-8 md:pb-8">
        <div className="mx-auto flex max-w-[1120px] flex-wrap items-center justify-between gap-3 px-6">
          <span className="text-[13px] font-bold tracking-[0.12em] text-[#5c6570]">DOMICIAL</span>
          <span className="text-[13px] text-[#9aa3ad]">© {year} Domicial. Tous droits réservés.</span>
        </div>
      </footer>
    </div>
  );
}
