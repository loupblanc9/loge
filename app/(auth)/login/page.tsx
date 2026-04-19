"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { apiFetch, ApiError } from "@/lib/api/client";
import { Spinner } from "@/components/brand/Spinner";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      await apiFetch("/api/auth/login", { method: "POST", json: { email, password } });
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
      <div className="mb-6 flex items-center gap-3">
        <span
          className="flex h-11 w-11 items-center justify-center rounded-xl text-lg font-bold text-white shadow-md"
          style={{ background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)" }}
        >
          D
        </span>
        <div>
          <h1 className="text-lg font-semibold text-[#111827]">Domicial</h1>
          <p className="text-sm text-[#374151]">Connexion à votre espace</p>
        </div>
      </div>
      <form onSubmit={onSubmit} className="space-y-4">
        {err && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-[#DC2626]">{err}</p>}
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
          <label className="domicial-field-label">Mot de passe</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="domicial-field-input"
            autoComplete="current-password"
          />
        </div>
        <button type="submit" disabled={loading} className="domicial-btn-primary">
          {loading ? (
            <>
              <Spinner className="h-4 w-4 text-white" />
              Connexion en cours…
            </>
          ) : (
            "Se connecter"
          )}
        </button>
      </form>
      <p className="mt-5 text-center text-sm text-[#374151]">
        Pas de compte ?{" "}
        <Link href="/register" className="font-semibold text-[#2563EB] transition hover:text-[#1d4ed8] hover:underline">
          Créer un compte
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
