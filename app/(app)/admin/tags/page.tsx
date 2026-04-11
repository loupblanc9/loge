"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMe, useTags, useCreateTag, useUpdateTag, useDeleteTag } from "@/hooks/queries";
import { useState } from "react";

export default function AdminTagsPage() {
  const { data: user, isLoading } = useMe();
  const router = useRouter();
  const { data, refetch } = useTags();
  const create = useCreateTag();
  const update = useUpdateTag();
  const del = useDeleteTag();
  const [name, setName] = useState("");
  const [color, setColor] = useState("#2563EB");
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("#2563EB");

  useEffect(() => {
    if (!isLoading && user && user.role !== "admin") router.replace("/dashboard");
  }, [isLoading, user, router]);

  if (isLoading || user?.role !== "admin") {
    return <div className="py-12 text-center text-sm text-gray-500">…</div>;
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-xl font-semibold text-[#111827]">Gestion des tags</h1>
      <p className="text-sm text-[#374151]">Créer, modifier ou supprimer les tags disponibles.</p>

      <form
        className="mt-6 flex flex-wrap items-end gap-2 rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
        onSubmit={(e) => {
          e.preventDefault();
          create.mutate(
            { name, color },
            {
              onSuccess: () => {
                setName("");
                refetch();
              },
            },
          );
        }}
      >
        <div className="flex-1 min-w-[140px]">
          <label className="text-xs text-gray-500">Créer un nouveau tag</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-200 px-2 py-1.5 text-sm"
            placeholder="Nom"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500">Couleur</label>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="mt-1 h-9 w-14 cursor-pointer rounded border border-gray-200"
          />
        </div>
        <button
          type="submit"
          disabled={!name.trim() || create.isPending}
          className="rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-medium text-white"
        >
          +
        </button>
      </form>

      <ul className="mt-6 space-y-2">
        {data?.tags.map((t) => (
          <li
            key={t.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm"
          >
            {editId === t.id ? (
              <>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="rounded border px-2 py-1 text-sm"
                />
                <input
                  type="color"
                  value={editColor}
                  onChange={(e) => setEditColor(e.target.value)}
                  className="h-8 w-12"
                />
                <button
                  type="button"
                  className="text-sm text-[#2563EB]"
                  onClick={() =>
                    update.mutate(
                      { id: t.id, name: editName, color: editColor },
                      {
                        onSuccess: () => {
                          setEditId(null);
                          refetch();
                        },
                      },
                    )
                  }
                >
                  OK
                </button>
                <button type="button" className="text-sm text-gray-500" onClick={() => setEditId(null)}>
                  Annuler
                </button>
              </>
            ) : (
              <>
                <span
                  className="rounded-full px-3 py-1 text-sm font-medium ring-1 ring-gray-200"
                  style={{ backgroundColor: `${t.color}22` }}
                >
                  {t.name}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="text-sm text-[#2563EB]"
                    onClick={() => {
                      setEditId(t.id);
                      setEditName(t.name);
                      setEditColor(t.color.startsWith("#") ? t.color : "#2563EB");
                    }}
                  >
                    ✎
                  </button>
                  <button
                    type="button"
                    className="text-sm text-[#DC2626]"
                    onClick={() => del.mutate(t.id, { onSuccess: () => refetch() })}
                  >
                    🗑
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
