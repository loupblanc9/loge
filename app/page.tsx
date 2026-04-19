import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { redirect } from "next/navigation";
import { LandingPage } from "@/components/marketing/LandingPage";
import { getSession } from "@/lib/auth/get-session";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "Domicial — Votre dossier logement, simplifié",
  description:
    "Créez votre dossier de logement en une minute. Centralisez vos documents, suivez votre demande — simple, rapide et sécurisé.",
};

export default async function Home() {
  const user = await getSession();
  if (user) redirect("/dashboard");
  return (
    <div className={inter.className}>
      <LandingPage />
    </div>
  );
}
