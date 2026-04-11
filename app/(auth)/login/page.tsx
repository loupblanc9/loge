"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiFetch, ApiError } from "@/lib/api/client";

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
    <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
      <div className="mb-6 flex items-center gap-2">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#2563EB] text-lg font-bold text-white">D</span>
        <div>
          <h1 className="text-lg font-semibold text-[#111827]">DossierLoc</h1>
          <p className="text-sm text-[#374151]">Connexion</p>
        </div>
      </div>
      <form onSubmit={onSubmit} className="space-y-4">
        {err && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-[#DC2626]">{err}</p>}
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
          <label className="text-xs font-medium text-gray-600">Mot de passe</label>
          <input
            type="password"
            required
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
          {loading ? "Connexion…" : "Se connecter"}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-[#374151]">
        Pas de compte ?{" "}
        <Link href="/register" className="font-medium text-[#2563EB] hover:underline">
          Créer un compte
        </Link>
      </p>
    </div>
  );
}
