"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { apiFetch, ApiError } from "@/lib/api/client";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { Spinner } from "@/components/brand/Spinner";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      await apiFetch("/api/auth/register", {
        method: "POST",
        json: { name, email, password, ...(phone.trim() ? { phone: phone.trim() } : {}) },
      });
      router.push("/dashboard");
      router.refresh();
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35, delay: 0.08 }}
      className="domicial-auth-card"
    >
      <div className="mb-2">
        <BrandLogo href="/" variant="full" size="lg" theme="light" className="mb-4" />
        <h1 className="text-xl font-semibold text-[#111827]">Créer un compte</h1>
        <p className="text-sm text-[#374151]">Accès à vos dossiers locatifs</p>
      </div>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        {err && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-[#DC2626]">{err}</p>}
        <div>
          <label className="domicial-field-label">Nom complet</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="domicial-field-input"
            autoComplete="name"
          />
        </div>
        <div>
          <label className="domicial-field-label">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="domicial-field-input"
            autoComplete="email"
          />
        </div>
        <div>
          <label className="domicial-field-label">Téléphone (optionnel)</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="domicial-field-input"
            autoComplete="tel"
            placeholder="06 12 34 56 78"
          />
        </div>
        <div>
          <label className="domicial-field-label">Mot de passe (min. 8 caractères)</label>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="domicial-field-input"
            autoComplete="new-password"
          />
        </div>
        <button type="submit" disabled={loading} className="domicial-btn-primary">
          {loading ? (
            <>
              <Spinner className="h-4 w-4 text-white" />
              Création en cours…
            </>
          ) : (
            "S'inscrire"
          )}
        </button>
      </form>
      <p className="mt-5 text-center text-sm text-[#374151]">
        Déjà inscrit ?{" "}
        <Link href="/login" className="font-semibold text-[#2563EB] transition hover:text-[#1d4ed8] hover:underline">
          Connexion
        </Link>
      </p>
      <p className="mt-4 text-center">
        <Link href="/" className="text-xs font-medium text-[#6b7280] transition hover:text-[#2563EB]">
          ← Retour à l’accueil
        </Link>
      </p>
    </motion.div>
  );
}
