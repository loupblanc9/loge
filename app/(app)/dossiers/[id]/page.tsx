import { redirect, notFound } from "next/navigation";
import { getSession } from "@/lib/auth/get-session";
import { prisma } from "@/lib/prisma";
import { ClientDossierPage } from "./ui";

type Props = { params: Promise<{ id: string }> };

export default async function DossierPage({ params }: Props) {
  const user = await getSession();
  if (!user) redirect("/login");
  const { id } = await params;
  const d = await prisma.dossier.findUnique({ where: { id }, select: { userId: true } });
  if (!d) notFound();
  if (user.role !== "admin" && d.userId !== user.id) {
    redirect("/dossiers/mes");
  }
  return <ClientDossierPage dossierId={id} user={user} />;
}
