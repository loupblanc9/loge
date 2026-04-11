"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiFetch, ApiError } from "@/lib/api/client";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      await apiFetch("/api/auth/register", { method: "POST", json: { name, email, password } });
      router.push("/dashboard");
      router.refresh();
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
      <h1 className="text-xl font-semibold text-[#111827]">Créer un compte</h1>
      <p className="mt-1 text-sm text-[#374151]">Compte locataire — accès à vos dossiers</p>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        {err && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-[#DC2626]">{err}</p>}
        <div>
          <label className="text-xs font-medium text-gray-600">Nom complet</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#2563EB]"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#2563EB]"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600">Mot de passe (min. 8 caractères)</label>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#2563EB]"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-[#2563EB] py-2.5 text-sm font-semibold text-white hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? "Création…" : "S'inscrire"}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-[#374151]">
        Déjà inscrit ?{" "}
        <Link href="/login" className="font-medium text-[#2563EB] hover:underline">
          Connexion
        </Link>
      </p>
    </div>
  );
}
